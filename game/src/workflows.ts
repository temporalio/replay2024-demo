import {
  proxyActivities,
  proxyLocalActivities,
  defineSignal,
  setHandler,
  condition,
  defineUpdate,
  log,
  startChild,
  workflowInfo,
  sleep,
  getExternalWorkflowHandle,
  defineQuery,
} from '@temporalio/workflow';

import type * as activities from './activities';

const SNAKE_WORK_DURATION_MS = 200;
const SNAKE_WORKERS_PER_TEAM = 1;
const APPLE_POINTS = 10;

const { snakeWork } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 seconds',
});

const { snakeMovedNotification, roundUpdateNotification } = proxyLocalActivities<typeof activities>({
  startToCloseTimeout: '1 seconds',
});

type GameConfig = {
  width: number;
  height: number;
  teams: string[];
  snakesPerTeam: number;
};

type Game = {
  config: GameConfig;
  teams: Team[];
  round: Round | null;
};

type Team = {
  name: string;
  players: Player[];
  score: number;
};

type Player = {
  id: string;
};

export type Round = {
  apple: Apple;
  teams: Team[];
  snakes: Snake[];
  duration: number;
  startedAt?: number;
  finished?: boolean;
  stale?: boolean;
};

type Point = {
  x: number;
  y: number;
};

type Apple = Point;

type Segment = {
  start: Point;
  direction: Direction;
  length: number;
};

export type Snake = {
  team: Team;
  id: string;
  segments: Segment[];
};

type Direction = 'up' | 'down' | 'left' | 'right';

export const gameStateQuery = defineQuery<Game>('gameState');

// UI -> GameWorkflow to start round
export const roundStartUpdate = defineUpdate<Round, [number]>('roundStart');
// UI -> GameWorkflow to finish game (may produce some kind of summary or whatever)
export const gameFinishedSignal = defineSignal('gameFinished');

// Player UI -> PlayerWorkflow to join team
export const playerJoinTeamUpdate = defineUpdate<void, [string, string]>('playerJoinTeam');
// Player UI -> PlayerWorkflow to wait until they are put into a round
export const playerWaitForRoundUpdate = defineUpdate<string>('playerWaitForRound');

// Game -> PlayerWorkflow to allocate them to a snake for a round
export const playerSnakeSignal = defineSignal<[string]>('playerSnake');

// PlayerWorkflow -> GameWorkflow to join team
export const playerJoinTeamRequestSignal = defineSignal<[string, string]>('playerJoinTeamRequest');
// GameWorkflow -> PlayerWorkflow acknowledging team join
export const playerJoinTeamResponseSignal = defineSignal<[string]>('playerJoinTeamResponse');

// Player UI -> SnakeWorkflow to change direction
export const snakeChangeDirectionSignal = defineSignal<[Direction]>('snakeChangeDirection');

// (Internal) Game -> SnakeWorkflow to signal round finished
export const roundFinishedSignal = defineSignal('roundFinished');
// (Internal) SnakeWorkflow -> Game to trigger a move
export const snakeMoveSignal = defineSignal<[string, Direction]>('snakeMove');

function roundPending(game: Game): boolean {
  return game.round !== null && !!game.round.startedAt;
}

function roundActive(game: Game): boolean {
  const round = game.round;
  return round != null && !!round.startedAt && !round.finished;
}

function moveSnake(game: Game, snakeId: string, direction: Direction): Snake {
  if (!roundActive(game)) {
    throw new Error('Cannot move snake, no active round');
  }
  const round = game.round!;

  const snake = round.snakes.find((snake) => snake.id === snakeId);
  if (!snake) {
    throw new Error('Cannot move snake, unable to find snake');
  }

  let headSegment = snake.segments[0];
  let tailSegment = snake.segments[snake.segments.length - 1];

  const currentDirection = headSegment.direction;
  let newDirection = direction;

  // You can't go back on yourself
  if (newDirection === oppositeDirection(currentDirection)) {
    newDirection = currentDirection;
  }

  let head = headSegment.start;

  // Create a new segment if we're changing direction or hitting an edge
  if (newDirection !== currentDirection || againstAnEdge(game, head)) {
    headSegment = { start: { x: head.x, y: head.y }, direction, length: 1 };
    head = headSegment.start;
    snake.segments.unshift(headSegment);
  }

  // Move the head segment, wrapping around if are moving past the edge
  if (newDirection === 'up') {
    head.y = head.y == game.config.height ? 0 : head.y + 1;
  } else if (newDirection === 'down') {
    head.y = head.y == 0 ? game.config.height : head.y - 1;
  } else if (newDirection === 'left') {
    head.x = head.x == 0 ? game.config.width : head.x - 1;
  } else if (newDirection === 'right') {
    head.x = head.x == game.config.width ? 0 : head.x + 1;
  }

  // Check if we've hit the apple
  // Normally after moving the head of the snake, we'll trim the tail to emulate the snake moving.
  if (appleAt(game, head)) {
    // We hit the apple, so create a new apple.
    round.apple = randomEmptyPoint(game);
    snake.team.score! += APPLE_POINTS;
    round.stale = true;

    // We return now to avoid trimming the tail, allowing the snake to grow by one segment.
    return snake;
  }

  // Check if we've hit another snake
  if (snakeAt(game, head)) {
    // Truncate the snake to just the head
    headSegment.length = 1;
    snake.segments = [headSegment];

    return snake;
  }
  
  if (tailSegment.length > 1) {
    tailSegment.length--;
  } else if (snake.segments.length > 1) {
    // Remove the tail segment unless it's also the head segment
    snake.segments.pop();
  }

  return snake;
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

function againstAnEdge(game: Game, point: Point): boolean {
  return point.x === 0 || point.x === game.config.width || point.y === 0 || point.y === game.config.height;
}

function appleAt(game: Game, point: Point): boolean {
  return game.round!.apple.x === point.x && game.round!.apple.y === point.y;
}

function calculateRect(segment: Segment): { x1: number, x2: number, y1: number, y2: number } {
  const { direction, start, length } = segment;
  let x = [];
  let y = [];

  if (direction === 'up' || direction === 'down') {
    x = [start.x, start.x];
    y = [start.y, start.y + (length * (direction === 'up' ? -1 : 1))];
  } else {
    x = [start.x, start.x + (length * (direction === 'left' ? -1 : 1))];
    y = [start.y, start.y];
  }

  x.sort((a, b) => a - b);
  y.sort((a, b) => a - b);

  return { x1: x[0], x2: x[1], y1: y[0], y2: y[1] };
}

function snakeAt(game: Game, point: Point): Snake | undefined {
  for (const snake of game.round?.snakes || []) {
    for (const segment of snake.segments) {
      const rect = calculateRect(segment);

      if (point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y1 && point.y <= rect.y2) {
        return snake;
      }
    }
  }

  return undefined;
}

function randomEmptyPoint(game: Game): Point {
  let point = { x: Math.floor(Math.random() * game.config.width), y: Math.floor(Math.random() * game.config.height) };
  while (appleAt(game, point) || snakeAt(game, point)) {
    point = { x: Math.floor(Math.random() * game.config.width), y: Math.floor(Math.random() * game.config.height) };
  }
  return { x: Math.floor(Math.random() * game.config.width), y: Math.floor(Math.random() * game.config.height) };
}

function randomDirection(): Direction {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function createSnakes(game: Game): Snake[] {
  return game.teams.flatMap((team) => {
    return Array.from({ length: game.config.snakesPerTeam }).map((_, i) => {
      return {
        id: `${team.name}-${i}`,
        team,
        segments: [{ start: randomEmptyPoint(game), length: 1, direction: randomDirection() }],
      };
    });
  });
}

function findNextPlayer(team: Team): Player {
  const nextPlayer = team.players.shift();
  if (!nextPlayer) {
    throw new Error('No players left on team');
  }
  team.players.push(nextPlayer);
  return nextPlayer;
}

function assignSnakeToPlayer(snake: Snake, team: Team): Promise<void> {
  const player = findNextPlayer(team);
  const playerHandle = getExternalWorkflowHandle(player.id);
  return playerHandle.signal(playerSnakeSignal, snake.id);
}

export async function GameWorkflow(config: GameConfig): Promise<void> {
  log.info('Starting game');

  const gameId = workflowInfo().workflowId;

  const game: Game = {
    config,
    teams: config.teams.map((name) => ({ name, players: [], score: 0 })),
    round: null,
  };

  setHandler(gameStateQuery, () => game);

  setHandler(playerJoinTeamRequestSignal, async (playerId, teamName) => {
    const team = game.teams.find((team) => team.name === teamName);
    if (!team) {
      log.error(`Player join failed: team ${teamName} not found`);
      return;
    }

    team.players.push({ id: playerId });

    const player = getExternalWorkflowHandle(playerId);
    await player.signal(playerJoinTeamResponseSignal, teamName);
  });

  setHandler(
    roundStartUpdate,
    async (duration): Promise<Round> => {
      const snakes = createSnakes(game);

      await Promise.all(
        snakes.map((snake) => startChild(SnakeWorkflow, { workflowId: snake.id, args: [gameId, snake] }))
      );
      await Promise.all(snakes.map((snake) => assignSnakeToPlayer(snake, snake.team)));

      game.round = { apple: randomEmptyPoint(game), teams: game.teams, snakes, duration };

      return game.round;
    },
    {
      validator: (_) => {
        if (roundPending(game)) {
          throw new Error('Pending round already exists');
        }
        if (roundActive(game)) {
          throw new Error('Round already in progress');
        }
        game.teams.forEach((team) => {
          if (team.players.length < game.config.snakesPerTeam) {
            throw new Error(`Not enough players on ${team.name} team`);
          }
        });
      },
    }
  );

  setHandler(snakeMoveSignal, async (id, direction) => {
    const snake = moveSnake(game, id, direction);
    const round = game.round!;

    log.info('Snake moved', { snake: id, direction: direction });

    let notifications = [snakeMovedNotification(snake)];
    if (round.stale) {
      notifications.push(roundUpdateNotification(round));
      round.stale = false;
    }

    await Promise.all(notifications);
  });

  let gameFinished = false;
  setHandler(gameFinishedSignal, async () => {
    gameFinished = true;
  });

  while (true) {
    log.info('Waiting for round to start or game to finish');
    await condition(() => gameFinished || roundPending(game));
    if (gameFinished) {
      break;
    }

    const round = game.round!;

    log.info('Starting round timer', { duration: round.duration });

    round.startedAt = Date.now();
    await sleep(round.duration * 1000);
    round.finished = true;
    await roundUpdateNotification(round);

    log.info('Round ended');

    await Promise.all(round.snakes.map((snake) => getExternalWorkflowHandle(snake.id).signal(roundFinishedSignal)));
  }

  log.info('Finished game');
}

export async function PlayerWorkflow(): Promise<void> {
  const id = workflowInfo().workflowId;

  log.info('Player online', { id });

  let team: string | null = null;
  let snake: string | null = null;

  setHandler(playerJoinTeamUpdate, async (gameId: string, teamName: string): Promise<void> => {
    log.info('Player joining game', { id, game: gameId, team: teamName });

    const game = getExternalWorkflowHandle(gameId);
    await game.signal(playerJoinTeamRequestSignal, id, teamName);
    await condition(() => team !== null);

    log.info('Player joined team', { id, team: teamName });
  });

  setHandler(playerJoinTeamResponseSignal, async (teamName) => {
    team = teamName;
  });

  // TODO: Handle game finished

  setHandler(
    playerWaitForRoundUpdate,
    async (): Promise<string> => {
      log.info('Player waiting for round', { id });

      await condition(() => snake !== null);

      return snake!;
    },
    {
      validator: () => {
        if (team === null) {
          throw new Error('Player not in a team');
        }
      },
    }
  );

  setHandler(playerSnakeSignal, async (snakeId) => {
    log.info('Player assigned to snake', { id, snake: snakeId });

    snake = snakeId;
  });

  await condition(() => false);
}

export async function SnakeWorkflow(gameId: string, snake: Snake): Promise<void> {
  log.info('Created snake', { id: snake.id, team: snake.team.name });

  const game = getExternalWorkflowHandle(gameId);
  const workflowId = workflowInfo().workflowId;
  let direction = snake.segments[0].direction;

  setHandler(snakeChangeDirectionSignal, (newDirection) => {
    if (newDirection === direction) {
      return;
    }

    log.info('Requesting direction change', { snake: snake.id, newDirection });
    direction = newDirection;
  });

  let finished = false;

  setHandler(roundFinishedSignal, () => {
    finished = true;
  });

  while (!finished) {
    // log.info('Sending snake move signal', { snake: snake.id, direction });
    const work = Array.from({ length: SNAKE_WORKERS_PER_TEAM }).map(() => snakeWork(SNAKE_WORK_DURATION_MS));
    await Promise.all(work);
    // Chances are we receive finished while waiting for the work to complete
    if (!finished) { await game.signal(snakeMoveSignal, workflowId, direction); }
  }
}
