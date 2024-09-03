import {
  proxyActivities,
  proxyLocalActivities,
  defineSignal,
  setHandler,
  condition,
  log,
  startChild,
  workflowInfo,
  sleep,
  getExternalWorkflowHandle,
  defineQuery,
  continueAsNew,
} from '@temporalio/workflow';

import type * as activities from './activities';

const ROUND_WF_ID = 'SnakeGameRound';
const SNAKE_WORK_DURATION_MS = 50;
const SNAKE_WORKERS_PER_TEAM = 1;
const APPLE_POINTS = 10;
const SNAKE_MOVES_BEFORE_CAN = 500;

const { snakeNom } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
});

const { playerInvitation, snakeMovedNotification, roundStartedNotification, roundUpdateNotification, roundFinishedNotification, lobbyNotification } = proxyLocalActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
});

type GameConfig = {
  width: number;
  height: number;
  teamNames: string[];
  snakesPerTeam: number;
};

type Game = {
  config: GameConfig;
  teams: Teams;
};

export type Lobby = {
  teams: TeamSummaries;
}

type TeamSummaries = Record<string, TeamSummary>;

type Team = {
  name: string;
  players: Player[];
  score: number;
};

type TeamSummary = {
  name: string;
  players: number;
  score: number;
};

type Player = {
  id: string;
  name: string;
  score: number;
};

export type Teams = Record<string, Team>;
type Snakes = Record<string, Snake>;

export type Round = {
  config: GameConfig;
  apple: Apple;
  teams: Teams;
  snakes: Snakes;
  duration: number;
  startedAt?: number;
  finished?: boolean;
};

type Point = {
  x: number;
  y: number;
};

const OutOfBounds: Readonly<Point> = { x: 0, y: 0 };

type Apple = Point;

type Segment = {
  head: Point;
  direction: Direction;
  length: number;
};

export type Snake = {
  id: string;
  teamName: string;
  playerId: string;
  segments: Segment[];
  ateApple?: boolean;
};

type Direction = 'up' | 'down' | 'left' | 'right';

function randomDirection(): Direction {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function oppositeDirection(direction: Direction): Direction {
  if (direction === 'up') {
    return 'down';
  } else if (direction === 'down') {
    return 'up';
  } else if (direction === 'left') {
    return 'right';
  } else {
    return 'left';
  }
}

export const gameStateQuery = defineQuery<Game>('gameState');
export const lobbyQuery = defineQuery<Lobby>('lobby');
export const roundStateQuery = defineQuery<Round>('roundState');

type RoundStartSignal = {
  duration: number;
}
// UI -> GameWorkflow to start round
export const roundStartSignal = defineSignal<[RoundStartSignal]>('roundStart');

// Player UI -> GameWorkflow to join team
type PlayerJoinSignal = {
  id: string;
  name: string;
  teamName: string;
}
export const playerJoinSignal = defineSignal<[PlayerJoinSignal]>('playerJoin');

// Player UI -> SnakeWorkflow to change direction
export const snakeChangeDirectionSignal = defineSignal<[Direction]>('snakeChangeDirection');

// (Internal) SnakeWorkflow -> Round to trigger a move
export const snakeMoveSignal = defineSignal<[string, Direction]>('snakeMove');

export async function GameWorkflow(config: GameConfig): Promise<void> {
  log.info('Starting game');

  const game: Game = {
    config,
    teams: config.teamNames.reduce<Teams>((acc, name) => {
      acc[name] = { name, players: [], score: 0 };
      return acc;
    }, {}),
  };
  const lobby: Lobby = {
    teams: config.teamNames.reduce<TeamSummaries>((acc, name) => {
      acc[name] = { name, players: 0, score: 0 };
      return acc;
    }, {}),
  };

  setHandler(gameStateQuery, () => {
    return game;
  });
  setHandler(lobbyQuery, () => {
    return lobby;
  });

  setHandler(playerJoinSignal, async ({ id, name, teamName }) => {
    const team = game.teams[teamName];

    team.players.push({ id, name, score: 0 });
    lobby.teams[teamName].players = team.players.length;

    await lobbyNotification(lobby);
  });

  let roundStart = false;
  let roundDuration = 0;
  setHandler(roundStartSignal, async ({ duration }) => {
    roundStart = true;
    roundDuration = duration;
  });

  while (true) {
    await condition(() => roundStart);
    roundStart = false;
    const roundWf = await startChild(RoundWorkflow, {
      workflowId: ROUND_WF_ID,
      args: [{ config, teams: buildRoundTeams(game), duration: roundDuration }]
    });
    const round = await roundWf.result();

    for (const team of Object.values(round.teams)) {
      game.teams[team.name].score += team.score;
      lobby.teams[team.name].score += team.score;
    }
  }
}

type RoundWorkflowInput = {
  config: GameConfig;
  teams: Teams;
  duration: number;
}

export async function RoundWorkflow({ config, teams, duration }: RoundWorkflowInput): Promise<Round> {
  log.info('Starting round', { duration });

  const round: Round = {
    config: config,
    duration: duration,
    apple: OutOfBounds,
    teams: teams,
    snakes: buildSnakes(config, teams),
  };

  randomizeRound(round);

  setHandler(roundStateQuery, () => {
    return round;
  });

  setHandler(snakeMoveSignal, async (id, direction) => {
    if (round.finished) { return }
    const snake = round.snakes[id];

    moveSnake(round, snake, direction);

    const notifications = [snakeMovedNotification(snake)];
    if (snake.ateApple) {
      round.apple = randomEmptyPoint(round);
      round.teams[snake.teamName].score += APPLE_POINTS;
      notifications.push(roundUpdateNotification(round));
      snake.ateApple = false;
    }

    await Promise.all(notifications);
  });

  await startSnakes(round.snakes);

  log.info('Starting round timer', { duration: round.duration });
  round.startedAt = Date.now();

  await Promise.all([
    roundStartedNotification(round),
    sleep(round.duration * 1000)
  ]);

  round.finished = true;

  await roundFinishedNotification(round);

  log.info('Round ended');

  return round;
}

type SnakeWorkflowInput = {
  roundId: string;
  id: string;
  direction: Direction;
};

export async function SnakeWorkflow({ roundId, id, direction }: SnakeWorkflowInput): Promise<void> {
  setHandler(snakeChangeDirectionSignal, (newDirection) => {
    direction = newDirection;
  });

  const round = getExternalWorkflowHandle(roundId);
  const noms = Array.from({ length: SNAKE_WORKERS_PER_TEAM });
  let moves = 0;

  while (true) {
    await Promise.all(noms.map(() => snakeNom(id, SNAKE_WORK_DURATION_MS)));
    await round.signal(snakeMoveSignal, id, direction);
    if (moves++ > SNAKE_MOVES_BEFORE_CAN) {
      await continueAsNew<typeof SnakeWorkflow>({ roundId, id, direction });
    }
  }
}

function moveSnake(round: Round, snake: Snake, direction: Direction) {
  const config = round.config;

  let headSegment = snake.segments[0];
  let tailSegment = snake.segments[snake.segments.length - 1];

  const currentDirection = headSegment.direction;
  let newDirection = direction;

  // You can't go back on yourself
  if (newDirection === oppositeDirection(currentDirection)) {
    newDirection = currentDirection;
  }

  let head = headSegment.head;

  // Create a new segment if we're changing direction or hitting an edge
  if (newDirection !== currentDirection || againstAnEdge(round, head, direction)) {
    headSegment = { head: { x: head.x, y: head.y }, direction, length: 0 };
    head = headSegment.head;
    snake.segments.unshift(headSegment);
  }

  let newHead: Point = { x: head.x, y: head.y };

  // Move the head segment, wrapping around if we are moving past the edge
  if (newDirection === 'up') {
    newHead.y = newHead.y <= 1 ? config.height : head.y - 1;
  } else if (newDirection === 'down') {
    newHead.y = newHead.y >= config.height ? 1 : head.y + 1;
  } else if (newDirection === 'left') {
    newHead.x = newHead.x <= 1 ? config.width : head.x - 1;
  } else if (newDirection === 'right') {
    newHead.x = newHead.x >= config.width ? 1 : head.x + 1;
  }

  // Check if we've hit another snake
  if (snakeAt(round, newHead, snake)) {
    // Truncate the snake to just the head, and ignore the requested move
    headSegment.length = 1;
    snake.segments = [headSegment];

    return;
  }

  // Check if we've hit the apple
  if (appleAt(round, newHead)) {
    snake.ateApple = true;
    tailSegment.length += 1;
  }

  headSegment.head = newHead;

  if (snake.segments.length > 1) {
    headSegment.length += 1;
    tailSegment.length -= 1;
    if (tailSegment.length === 0) {
      snake.segments.pop();
    }
  }
}

function againstAnEdge(round: Round, point: Point, direction: Direction): boolean {
  if (direction === 'up') {
    return point.y === 1;
  } else if (direction === 'down') {
    return point.y === round.config.height;
  } else if (direction === 'left') {
    return point.x === 1;
  } else {
    return point.x === round.config.width;
  }
}

function appleAt(round: Round, point: Point): boolean {
  return round.apple.x === point.x && round.apple.y === point.y;
}

function calculateRect(segment: Segment): { x1: number, x2: number, y1: number, y2: number } {
  const { direction, head: start, length } = segment;
  let x = [];
  let y = [];

  if (direction === 'up' || direction === 'down') {
    x = [start.x, start.x];
    y = [start.y, start.y + ((length - 1) * (direction === 'up' ? 1 : -1))];
  } else {
    x = [start.x, start.x + ((length - 1) * (direction === 'right' ? 1 : -1))];
    y = [start.y, start.y];
  }

  x.sort((a, b) => a - b);
  y.sort((a, b) => a - b);

  return { x1: x[0], x2: x[1], y1: y[0], y2: y[1] };
}

function snakeAt(round: Round, point: Point, skipSnake: Snake | null): Snake | undefined {
  for (const snake of Object.values(round.snakes)) {
    if (snake === skipSnake) {
      continue;
    }
    for (const segment of snake.segments) {
      const rect = calculateRect(segment);

      if (point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y1 && point.y <= rect.y2) {
        return snake;
      }
    }
  }

  return undefined;
}

function randomEmptyPoint(round: Round): Point {
  let point = { x: Math.ceil(Math.random() * round.config.width), y: Math.ceil(Math.random() * round.config.height) };
  while (appleAt(round, point) || snakeAt(round, point, null)) {
    point = { x: Math.ceil(Math.random() * round.config.width), y: Math.ceil(Math.random() * round.config.height) };
  }
  return { x: Math.ceil(Math.random() * round.config.width), y: Math.ceil(Math.random() * round.config.height) };
}

function buildSnakes(config: GameConfig, teams: Teams): Snakes {
  const snakes: Snakes = {};

  for (const teamName in teams) {
    for (let i = 0; i < config.snakesPerTeam; i++) {
      const snake = {
        id: `${teamName}-${i}`,
        teamName: teamName,
        segments: [{ head: OutOfBounds, length: 1, direction: 'down' as Direction }],
        playerId: teams[teamName].players[i].id,
      };
      snakes[snake.id] = snake;
    }
  };

  return snakes;
}

function buildRoundTeams(game: Game): Teams {
  const teams: Teams = {};

  for (const team of Object.values(game.teams)) {
    const players = Array.from({ length: game.config.snakesPerTeam }).map(() => nextPlayer(team));

    teams[team.name] = { name: team.name, players: players, score: 0 };
  }

  return teams;
}

async function startSnakes(snakes: Snakes) {
  const commands = Object.values(snakes).flatMap((snake) =>
    [
      startChild(SnakeWorkflow, {
        workflowId: snake.id,
        args: [{ roundId: ROUND_WF_ID, id: snake.id, direction: snake.segments[0].direction }]
      }),
      playerInvitation(snake.playerId, snake.id)
    ]
  )

  // TODO: Do these all get started in same WFT?
  await Promise.all(commands);
}

function nextPlayer(team: Team): Player {
  const nextPlayer = team.players.shift();
  if (!nextPlayer) {
    throw new Error('No players left on team');
  }
  team.players.push(nextPlayer);
  return nextPlayer;
}

function randomizeRound(round: Round) {
  round.apple = randomEmptyPoint(round);
  for (const snake of Object.values(round.snakes)) {
    snake.segments[0].head = randomEmptyPoint(round);
    snake.segments[0].direction = randomDirection();
  }
}

