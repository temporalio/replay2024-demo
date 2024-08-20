import {
  proxyActivities, defineSignal, setHandler, condition, defineUpdate,
  log, startChild, workflowInfo, sleep, getExternalWorkflowHandle
} from '@temporalio/workflow';

import type * as activities from './activities';

const SNAKE_WORK_DURATION_MS = 200;
const SNAKE_WORKERS_PER_TEAM = 1;
const APPLE_POINTS = 10;

const { snakeWork } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 seconds',
});

type Game = {
  width: number;
  height: number;
  teams: Team[];
  snakesPerTeam: number;
  round?: Round;
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

type Apple = Point;

type Segment = {
  start: Point;
  direction: Direction;
  length: number;
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

function moveSnake(game: Game, snakeId: string, direction: Direction): Snake {
  const round = game.round;
  if (!round) { 
    throw new Error('Cannot move snake, no active round');
  }

  const snake = round?.snakes.find((snake) => snake.id === snakeId);
  if (!snake) {
    throw new Error('Cannot move snake, unable to find snake');
  }

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

  // Check if we've hit another snake
  if (snakeAt(game, head)) {
    // Truncate the snake to just the head
    headSegment.length = 1;
    snake.segments = [headSegment];
    return snake;
  }

  // Check if we've hit the apple
  // Normally after moving the head of the snake, we'll trim the tail to emulate the snake moving.
  // If we've hit the apple, we skip trimming the tail, allowing the snake to grow by one segment.
  if (appleAt(game, head)) {
    // We hit the apple, so create a new one.
    // TODO: Notify the UI when a new apple is created.
    // Currently the UI only knows about the original apple via the Round returned by roundStartUpdate.
    round.apple = randomEmptyPoint(game);
    snake.team.score! += APPLE_POINTS;
  } else {
    if (tailSegment.length > 1) {
      tailSegment.length--;
    } else if (snake.segments.length > 1) {
      // Remove the tail segment unless it's also the head segment
      snake.segments.pop();
    }
  }

  return snake;
}

function appleAt(game: Game, point: Point): boolean {
  return game.round?.apple.x === point.x && game.round?.apple.y === point.y;
}

function snakeAt(game: Game, point: Point): Snake | undefined {
  for (const snake of game.round?.snakes || []) {
    for (const segment of snake.segments) {
      const direction = segment.direction;
      const start = segment.start;

      if (direction === "up" && point.x === start.x && point.y >= start.y && point.y < start.y + segment.length) {
        return snake;
      } else if (direction === "down" && point.x === start.x && point.y <= start.y && point.y > start.y - segment.length) {
        return snake;
      } else if (direction === "left" && point.y === start.y && point.x <= start.x && point.x > start.x - segment.length) {
        return snake;
      } else if (direction === "right" && point.y === start.y && point.x >= start.x && point.x < start.x + segment.length) {
        return snake;
      }
    }
  }

  return undefined;
}

function randomEmptyPoint(game: Game): Point {
  let point = { x: Math.floor(Math.random() * game.width), y: Math.floor(Math.random() * game.height) };
  while (appleAt(game, point) || snakeAt(game, point)) {
    point = { x: Math.floor(Math.random() * game.width), y: Math.floor(Math.random() * game.height) };
  }
  return { x: Math.floor(Math.random() * game.width), y: Math.floor(Math.random() * game.height) };
}

function createSnakes(game: Game): Snake[] {
  return game.teams.flatMap((team) => {
    return Array.from({ length: game.snakesPerTeam }).map((_, i) => {
      return { id: `${team.name}-${i}`, team, segments: [{ start: randomEmptyPoint(game), length: 1, direction: 'up' }] };
    });
  });
}

export async function GameWorkflow(game: Game): Promise<void> {
  log.info('Starting game');

  const gameId = workflowInfo().workflowId;

  game.teams.forEach((team) => team.score = 0);

  setHandler(roundStartUpdate, async (duration): Promise<Round> => {
    const snakes = createSnakes(game);

    await Promise.all(snakes.map((snake) => startChild(SnakeWorkflow, { workflowId: snake.id, args: [gameId, snake] })));

    game.round = { apple: randomEmptyPoint(game), teams: game.teams, snakes, duration };
    
    return game.round;
  }, { validator: (_) => { if (game.round) { throw new Error('Round already in progress'); } } });

  setHandler(snakeMoveSignal, async (id, direction) => {
    const snake = moveSnake(game, id, direction);

    log.info('Snake moved', { snake: id, direction: direction });
  });

  let gameFinished = false;
  setHandler(gameFinishedSignal, async () => {
    gameFinished = true;
  });

  while (true) {
    log.info('Waiting for round to start or game to finish');
    await condition(() => gameFinished || game.round !== undefined);
    if (gameFinished) { break; }
    
    const round = game.round!;

    log.info('Starting round timer', { duration: round.duration });
    await sleep(round.duration * 1000);
    log.info('Round ended');

    await Promise.all(round.snakes.map((snake) => getExternalWorkflowHandle(snake.id).signal(roundFinishedSignal)));
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
