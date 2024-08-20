import {
  proxyActivities, defineSignal, setHandler, condition, defineUpdate,
  log, startChild, workflowInfo, sleep, getExternalWorkflowHandle
} from '@temporalio/workflow';

import type * as activities from './activities';

const SNAKE_WORK_DURATION_MS = 200;
const SNAKE_WORKERS_PER_TEAM = 1;

const { snakeWork } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 seconds',
});

type Game = {
  width: number;
  height: number;
  teams: Team[];
  snakesPerTeam: number;
};

type Team = {
  name: string;
  score?: number;
}

type Round = {
  apple: Apple;
  teams: Team[];
  snakes: Snake[];
  duration: number;
}

type Point = {
  x: number;
  y: number;
}

type Segment = {
  start: Point;
  direction: Direction;
  length: number;
}

type Apple = {
  x: number;
  y: number;
}

type Snake = {
  team: Team;
  id: string;
  segments: Segment[];
}

type Direction = 'up' | 'down' | 'left' | 'right';

// UI -> GameWorkflow to start round
export const roundStartUpdate = defineUpdate<Round, [number]>('roundStart');
// UI -> GameWorkflow to finish game (may produce some kind of summary or whatever)
export const gameFinishedSignal = defineSignal('gameFinished');

// Player UI -> SnakeWorkflow to change direction
export const snakeChangeDirectionSignal = defineSignal<[Direction]>('snakeChangeDirection');9

// (Internal) Game -> SnakeWorkflow to signal round finished
export const roundFinishedSignal = defineSignal('roundFinished');
// (Internal) SnakeWorkflow -> Game to trigger a move
export const snakeMoveSignal = defineSignal<[string, Direction]>('snakeMove');

function moveSnake(game: Game, round: Round, snake: Snake, direction: Direction): Direction {
  let headSegment = snake.segments[0];
  let tailSegment = snake.segments[snake.segments.length-1];

  // You can't go back on yourself
  if (
    (headSegment.direction === 'up' && direction === 'down') ||
    (headSegment.direction === 'down' && direction === 'up') ||
    (headSegment.direction === 'left' && direction === 'right') ||
    (headSegment.direction === 'right' && direction === 'left')
  ) {
    log.info("Ignoring invalid direction change", { snake: snake.id, currentDirection: headSegment.direction, newDirection: direction });
    direction = headSegment.direction;
  }

  // TODO: Check collision with other snakes
  let head = headSegment.start;

  // Create a new segment if we're changing direction or hitting an edge
  if (direction !== headSegment.direction ||
      (direction === 'up' && head.y === game.height) ||
      (direction === 'down' && head.y === 0) ||
      (direction === 'left' && head.x === 0) ||
      (direction === 'right' && head.x === game.width)) {
    headSegment = { start: { x: head.x, y: head.y }, direction, length: 1 };
    head = headSegment.start;
    snake.segments.unshift(headSegment);
  }

  // Move the head segment, wrapping around if we hit the edge
  if (direction === 'up') {
    head.y = (head.y == game.height) ? 0 : head.y+1;
  } else if (direction === 'down') {
    head.y = (head.y == 0) ? game.height : head.y-1;
  } else if (direction === 'left') {
    head.x = (head.x == 0) ? game.width : head.x-1;
  } else if (direction === 'right') {
    head.x = (head.x == game.width) ? 0 : head.x+1;
  }

  // Check if we've hit the apple
  // Normally after moving the head of the snake, we'll trim the tail to emulate the snake moving.
  // If we've hit the apple, we skip trimming the tail, effectively growing the snake by one segment.
  if (head.x === round.apple.x && head.y === round.apple.y) {
    // We hit the apple, so create a new one.
    // TODO: Notify the UI when a new apple is created.
    // Currently the UI only knows about the original apple via the Round returned by roundStartUpdate.
    round.apple = createApple(game);
  } else {
    if (tailSegment.length > 1) {
      tailSegment.length--;
    } else if (snake.segments.length > 1) {
      // Remove the tail segment unless it's also the head segment
      snake.segments.pop();
    }
  }

  // Return the direction the snake actually moved
  return direction;
}

function createSnakes(game: Game): Snake[] {
  return game.teams.flatMap((team) => {
    return Array.from({ length: game.snakesPerTeam }).map((_, i) => {
      const start = { x: Math.floor(Math.random() * game.width), y: Math.floor(Math.random() * game.height) };
      return { id: `${team.name}-${i}`, team, segments: [{ start, length: 1, direction: 'up' }] };
    });
  });
}

function createApple(game: Game): Apple {
  return { x: Math.floor(Math.random() * game.width), y: Math.floor(Math.random() * game.height) };
}

export async function GameWorkflow(game: Game): Promise<void> {
  log.info('Starting game');

  const gameId = workflowInfo().workflowId;
  let gameFinished = false;
  let roundInProgress = false;
  let roundDuration = 0;
  let round: Round | null = null;
  let apple = createApple(game);
  let snakes: Snake[] = [];


  setHandler(roundStartUpdate, async (duration): Promise<Round> => {
    snakes = createSnakes(game);

    await Promise.all(snakes.map((snake) => startChild(SnakeWorkflow, { workflowId: snake.id, args: [gameId, snake] })));
    
    roundDuration = duration;
    roundInProgress = true;
    round = {
      duration,
      apple,
      teams: game.teams,
      snakes,
    }; 

    return round;
  }, { validator: (_) => { if (roundInProgress) { throw new Error('Round already in progress'); } } });

  setHandler(gameFinishedSignal, async () => {
    gameFinished = true;
  });

  setHandler(snakeMoveSignal, async (id, direction) => {
    const snake = snakes.find((snake) => snake.id === id);
    if (!snake) {
      log.error('Snake not found', { snake: id });
      return;
    }

    const moveDirection = moveSnake(game, round, snake, direction);

    log.info('Snake moved', { snake: id, requestedDirection: direction, movedDirection: moveDirection, segments: JSON.stringify(snake.segments) });
  });

  while (true) {
    log.info('Waiting for round to start or game to finish');
    await condition(() => gameFinished || roundInProgress);
    if (gameFinished) { break; }
    log.info('Starting round timer');
    await sleep(roundDuration * 1000);
    log.info('Round ended');
    roundInProgress = false;
    await Promise.all(snakes.map((snake) => getExternalWorkflowHandle(snake.id).signal(roundFinishedSignal)));
  }

  log.info('Finished game');
}

export async function SnakeWorkflow(gameId: string, snake: Snake): Promise<void> {
  log.info('Created snake', { id: snake.id, team: snake.team.name });

  const game = getExternalWorkflowHandle(gameId);
  const workflowId = workflowInfo().workflowId;
  let direction = snake.segments[0].direction;

  setHandler(snakeChangeDirectionSignal, (newDirection) => {
    if (newDirection !== direction) {
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
    log.info('Sending snake move signal', { snake: snake.id, direction });
    const work = Array.from({ length: SNAKE_WORKERS_PER_TEAM }).map(() => snakeWork(SNAKE_WORK_DURATION_MS));
    await Promise.all(work);
    await game.signal(snakeMoveSignal, workflowId, direction);
  }
}
