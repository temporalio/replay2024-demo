import {
  proxyActivities,
  proxyLocalActivities,
  defineSignal,
  setHandler,
  condition,
  log,
  startChild,
  sleep,
  getExternalWorkflowHandle,
  defineQuery,
  continueAsNew,
  ParentClosePolicy,
} from '@temporalio/workflow';

import type * as activities from './activities';
import { buildWorkerActivities } from './activities';

const ROUND_WF_ID = 'SnakeGameRound';
const APPLE_POINTS = 10;
const SNAKE_MOVES_BEFORE_CAN = 500;
const SNAKE_WORKER_DOWN_TIME = '5 seconds';
const SNAKE_WORKERS_PER_TEAM = 4;

const { snakeMovedNotification, roundStartedNotification, roundUpdateNotification, roundFinishedNotification } = proxyLocalActivities<typeof activities>({
  startToCloseTimeout: '1 seconds',
});

const { snakeWorker } = proxyActivities<ReturnType<typeof buildWorkerActivities>>({
  startToCloseTimeout: '1 day',
  heartbeatTimeout: '2 seconds',
  retry: {
    initialInterval: SNAKE_WORKER_DOWN_TIME,
    backoffCoefficient: 1,
  },
});

type GameConfig = {
  width: number;
  height: number;
  teamNames: string[];
  appleCount: number;
  snakesPerTeam: number;
  nomsPerMove: number;
  nomDuration: number;
};

type Game = {
  config: GameConfig;
  teams: Teams;
};

type Team = {
  name: string;
  score: number;
};
export type Teams = Record<string, Team>;

export type Round = {
  config: GameConfig;
  apples: Apple[];
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

type Apple = Point;

type Segment = {
  head: Point;
  direction: Direction;
  length: number;
};

export type Snake = {
  id: string;
  playerId: string;
  teamName: string;
  segments: Segment[];
  appleIndex?: number;
};
type Snakes = Record<string, Snake>;

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
export const roundStateQuery = defineQuery<Round>('roundState');

type RoundStartSignal = {
  snakes: Snake[];
  duration: number;
}
// UI -> GameWorkflow to start round
export const roundStartSignal = defineSignal<[RoundStartSignal]>('roundStart');

// Player UI -> SnakeWorkflow to change direction
export const snakeChangeDirectionSignal = defineSignal<[Direction]>('snakeChangeDirection');

// (Internal) SnakeWorkflow -> Round to trigger a move
export const snakeMoveSignal = defineSignal<[string, Direction]>('snakeMove');

export async function GameWorkflow(config: GameConfig): Promise<void> {
  log.info('Starting game');

  const game: Game = {
    config,
    teams: config.teamNames.reduce<Teams>((acc, name) => {
      acc[name] = { name, score: 0 };
      return acc;
    }, {}),
  };

  setHandler(gameStateQuery, () => {
    return game;
  });

  const workerManagers = config.teamNames.map((team) => {
    return startChild(SnakeWorkerManagerWorkflow, {
      workflowId: `${team}-worker-manager`,
      taskQueue: `${team}-team`,
      args: [{ team: team, count: SNAKE_WORKERS_PER_TEAM }],
    });
  });
  await Promise.all(workerManagers);

  let newRound: RoundWorkflowInput | undefined;
  setHandler(roundStartSignal, async ({ duration, snakes }) => {
    newRound = { config, teams: buildRoundTeams(game), duration, snakes };
  });

  while (true) {
    await condition(() => newRound !== undefined);
    const roundWf = await startChild(RoundWorkflow, {
      workflowId: ROUND_WF_ID,
      args: [newRound!],
      parentClosePolicy: ParentClosePolicy.PARENT_CLOSE_POLICY_REQUEST_CANCEL,
    });
    newRound = undefined;
    const round = await roundWf.result();

    for (const team of Object.values(round.teams)) {
      game.teams[team.name].score += team.score;
    }
  }
}

type RoundWorkflowInput = {
  config: GameConfig;
  teams: Teams;
  snakes: Snake[];
  duration: number;
}

export async function RoundWorkflow({ config, teams, snakes, duration }: RoundWorkflowInput): Promise<Round> {
  log.info('Starting round', { duration, snakes });

  const round: Round = {
    config: config,
    duration: duration,
    apples: [],
    teams: teams,
    snakes: snakes.reduce<Snakes>((acc, snake) => { acc[snake.id] = snake; return acc; }, {}),
  };

  setHandler(roundStateQuery, () => {
    return round;
  });

  setHandler(snakeMoveSignal, async (id, direction) => {
    if (round.finished) { return }
    const snake = round.snakes[id];

    moveSnake(round, snake, direction);

    const notifications = [snakeMovedNotification(snake)];

    // if the snake has eaten an apple, determine which one and remove it
    if (snake.appleIndex !== undefined) {
      round.apples[snake.appleIndex] = randomEmptyPoint(round);
      round.teams[snake.teamName].score += APPLE_POINTS;
      notifications.push(roundUpdateNotification(round));
      snake.appleIndex = undefined;
    }

    await Promise.all(notifications);
  });

  try {
    randomizeRound(round);

    await startSnakes(round.config, round.snakes);

    round.startedAt = Date.now();

    await Promise.all([
      roundStartedNotification(round),
      sleep(round.duration * 1000)
    ]);
  } finally {
    round.finished = true;
  }

  await roundFinishedNotification(round);

  log.info('Round ended');

  return round;
}

type SnakeWorkflowInput = {
  roundId: string;
  id: string;
  direction: Direction;
  nomsPerMove: number;
  nomDuration: number;
};

export async function SnakeWorkflow({ roundId, id, direction, nomsPerMove, nomDuration }: SnakeWorkflowInput): Promise<void> {
  setHandler(snakeChangeDirectionSignal, (newDirection) => {
    direction = newDirection;
  });

  const { snakeNom } = proxyActivities<typeof activities>({
    startToCloseTimeout: nomDuration * 2,
  });

  const round = getExternalWorkflowHandle(roundId);
  const noms = Array.from({ length: nomsPerMove });
  let moves = 0;

  while (true) {
    await Promise.all(noms.map(() => snakeNom(id, nomDuration)));
    await round.signal(snakeMoveSignal, id, direction);
    if (moves++ > SNAKE_MOVES_BEFORE_CAN) {
      await continueAsNew<typeof SnakeWorkflow>({ roundId, id, direction, nomsPerMove, nomDuration });
    }
  }
}

type SnakeWorkerManagerWorkflowInput = {
  team: string;
  count: number;
};

export async function SnakeWorkerManagerWorkflow({ team, count }: SnakeWorkerManagerWorkflowInput): Promise<void> {
  const workers = Array.from({ length: count }).map((_, i) => snakeWorker(`${team}-snake-worker-${i + 1}`));
  await Promise.all(workers);
};

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

  let currentHead = headSegment.head;

  // Create a new segment if we're changing direction or hitting an edge
  if (newDirection !== currentDirection || againstAnEdge(round, currentHead, direction)) {
    headSegment = { head: { x: currentHead.x, y: currentHead.y }, direction: newDirection, length: 0 };
    snake.segments.unshift(headSegment);
  }

  let newHead: Point = { x: currentHead.x, y: currentHead.y };

  // Move the head segment, wrapping around if we are moving past the edge
  if (newDirection === 'up') {
    newHead.y = newHead.y <= 1 ? config.height : currentHead.y - 1;
  } else if (newDirection === 'down') {
    newHead.y = newHead.y >= config.height ? 1 : currentHead.y + 1;
  } else if (newDirection === 'left') {
    newHead.x = newHead.x <= 1 ? config.width : currentHead.x - 1;
  } else if (newDirection === 'right') {
    newHead.x = newHead.x >= config.width ? 1 : currentHead.x + 1;
  }

  // Check if we've hit another snake
  if (snakeAt(round, newHead, snake)) {
    // Truncate the snake to just the head, and ignore the requested move
    headSegment.length = 1;
    snake.segments = [headSegment];
    return;
  }

  // Check if we've hit an apple
  const appleIndex = appleAt(round, newHead);
  if (appleIndex !== undefined) {
    // Snake ate an apple, set appleIndex
    snake.appleIndex = appleIndex;
    tailSegment.length += 1;  // Grow the snake by increasing the tail length

    // Replace the eaten apple with a new one at a random position
    round.apples[appleIndex] = randomEmptyPoint(round);
  }

  headSegment.head = newHead;

  // Manage snake segment growth and shrinking
  if (snake.segments.length > 1) {
    headSegment.length += 1;
    tailSegment.length -= 1;

    // Remove the tail segment if its length reaches 0
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

function appleAt(round: Round, point: Point): number | undefined {
  const index = round.apples.findIndex(apple => apple.x === point.x && apple.y === point.y);
  return index !== -1 ? index : undefined;
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
  // Check if any apple is at the point
  while (appleAt(round, point) || snakeAt(round, point, null)) {
    point = { x: Math.ceil(Math.random() * round.config.width), y: Math.ceil(Math.random() * round.config.height) };
  }
  return point;
}

function buildRoundTeams(game: Game): Teams {
  const teams: Teams = {};

  for (const team of Object.values(game.teams)) {
    teams[team.name] = { name: team.name, score: 0 };
  }

  return teams;
}

async function startSnakes(config: GameConfig, snakes: Snakes) {
  const commands = Object.values(snakes).map((snake) =>
    startChild(SnakeWorkflow, {
      workflowId: snake.id,
      taskQueue: `${snake.teamName}-team-snakes`,
      args: [{
        roundId: ROUND_WF_ID,
        id: snake.id,
        direction: snake.segments[0].direction,
        nomsPerMove: config.nomsPerMove,
        nomDuration: config.nomDuration,
      }]
    })
  )

  await Promise.all(commands);
}

function randomizeRound(round: Round) {
  // Reset apples
  round.apples = [];

  // Generate multiple apples based on the configured count
  for (let i = 0; i < round.config.appleCount; i++) {
    round.apples.push(randomEmptyPoint(round));
  }
  for (const snake of Object.values(round.snakes)) {
    snake.segments = [
      { head: randomEmptyPoint(round), direction: randomDirection(), length: 1 }
    ]
  }
}
