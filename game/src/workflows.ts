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
  ActivityCancellationType,
  CancellationScope,
  isCancellation,
} from '@temporalio/workflow';

import { buildGameActivities, buildWorkerActivities, buildTrackerActivities, Event } from './activities';
import { GameConfig, Game, Teams, Round, Snake, Snakes, Direction, Point, Segment } from './types';

const ROUND_WF_ID = 'SnakeGameRound';
const APPLE_POINTS = 10;
const SNAKE_MOVES_BEFORE_CAN = 50;
const SNAKE_WORKER_DOWN_TIME = '1 seconds';

const { emit } = proxyLocalActivities<ReturnType<typeof buildGameActivities>>({
  startToCloseTimeout: '1 seconds',
});

const { snakeWorker } = proxyActivities<ReturnType<typeof buildWorkerActivities>>({
  taskQueue: 'snake-workers',
  startToCloseTimeout: '1 hour',
  heartbeatTimeout: 500,
  cancellationType: ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
});

const { snakeTracker } = proxyActivities<ReturnType<typeof buildTrackerActivities>>({
  heartbeatTimeout: 500,
  startToCloseTimeout: '1 hour',
  cancellationType: ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
  retry: {
    initialInterval: 1,
    backoffCoefficient: 1,
  },
});

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

export const gameFinishSignal = defineSignal('gameFinish');

type RoundStartSignal = {
  snakes: Snake[];
}
// UI -> GameWorkflow to start round
export const roundStartSignal = defineSignal<[RoundStartSignal]>('roundStart');

// Player UI -> SnakeWorkflow to change direction
export const snakeChangeDirectionSignal = defineSignal<[Direction]>('snakeChangeDirection');

// (Internal) SnakeWorkflow -> Round to trigger a move
export const snakeMoveSignal = defineSignal<[string, Direction]>('snakeMove');

export const workerStopSignal = defineSignal('workerStop');

type WorkerStartedSignal = {
  identity: string;
};
export const workerStartedSignal = defineSignal<[WorkerStartedSignal]>('workerStarted');

export async function GameWorkflow(config: GameConfig): Promise<void> {
  log.info('Starting game');

  const game: Game = {
    config,
    teams: config.teamNames.reduce<Teams>((acc, name) => {
      acc[name] = { name, score: 0 };
      return acc;
    }, {}),
  };
  let finished = false;
  let roundScope: CancellationScope;

  setHandler(gameStateQuery, () => {
    return game;
  });

  setHandler(gameFinishSignal, () => {
    finished = true;
    roundScope?.cancel();
  });

  let newRound: RoundWorkflowInput | undefined;
  setHandler(roundStartSignal, async ({ snakes }) => {
    newRound = { config, teams: buildRoundTeams(game), snakes };
  });

  while (!finished) {
    await condition(() => finished || newRound !== undefined);
    if (finished) { break; }

    roundScope = new CancellationScope();

    try {
      await roundScope.run(async () => {
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
      });
    } catch (err) {
      if (!isCancellation(err)) { throw(err); }
    }
  }
}

type RoundWorkflowInput = {
  config: GameConfig;
  teams: Teams;
  snakes: Snake[];
}

type SnakeMove = {
  id: string;
  direction: Direction;
};

export async function RoundWorkflow({ config, teams, snakes }: RoundWorkflowInput): Promise<Round> {
  log.info('Starting round', { config, teams, snakes });

  const round: Round = {
    config: config,
    duration: config.roundDuration,
    apples: {},
    teams: teams,
    snakes: snakes.reduce<Snakes>((acc, snake) => { acc[snake.id] = snake; return acc; }, {}),
    finished: false,
  };

  const snakeMoves: SnakeMove[] = [];
  const workersStarted: string[] = [];

  setHandler(roundStateQuery, () => {
    return round;
  });

  setHandler(snakeMoveSignal, async (id, direction) => {
    if (round.finished) { return; }
    snakeMoves.push({ id, direction });
  });

  setHandler(workerStartedSignal, async ({ identity }) => {
    if (round.finished) { return; }
    workersStarted.push(identity);
  });

  const processSignals = async () => {
    const events: Event[] = [];
    const applesEaten: string[] = [];
    const signals = [];

    for (const move of snakeMoves) {
      const snake = round.snakes[move.id];
      moveSnake(round, snake, move.direction);
      events.push({ type: 'snakeMoved', payload: { snakeId: move.id, segments: snake.segments } });
      if (snake.ateAppleId) {
        applesEaten.push(snake.ateAppleId);
        round.teams[snake.teamName].score += APPLE_POINTS;
        snake.ateAppleId = undefined;
      }
    }

    for (const appleId of applesEaten) {
      if (config.killWorkers) {
        const worker = getExternalWorkflowHandle(appleId);
        signals.push(worker.signal(workerStopSignal));
        events.push({ type: 'worker:stop', payload: { identity: appleId } });
      } else {
        workersStarted.push(appleId);
      }
      delete round.apples[appleId];
    }

    for (const workerId of workersStarted) {
      round.apples[workerId] = randomEmptyPoint(round);
      events.push({ type: 'worker:start', payload: { identity: workerId } });
    }

    if (applesEaten.length || workersStarted.length) {
      events.push({ type: 'roundUpdate', payload: { round } });
    }

    snakeMoves.length = 0;
    workersStarted.length = 0;

    await Promise.all([emit(events), ...signals]);
  }

  randomizeRound(round);

  const workerCount = snakes.length * 2;

  try {
    await startWorkerManagers(workerCount);
    await startSnakeTrackers(round.snakes);
    await startSnakes(round.config, round.snakes);
    await emit([{ type: 'roundLoading', payload: { round } }]);

    // Wait for all workers to register
    while (true) {
      await condition(() => workersStarted.length > 0);
      await processSignals();
      if (Object.keys(round.apples).length === workerCount) { break; }
    }

    // Start the round
    round.startedAt = Date.now();

    Promise.race([
      sleep(round.duration * 1000),
      CancellationScope.current().cancelRequested,
    ])
    .then(() => log.info('Round timer expired'))
    .catch(() => log.info('Round cancelled'))
    .finally(() => round.finished = true);

    log.info('Round started', { round });
    await emit([{ type: 'roundStarted', payload: { round } }]);

    while (true) {
      await condition(() => round.finished || snakeMoves.length > 0 || workersStarted.length > 0);
      if (round.finished) { break; }

      await processSignals();
    }
  } catch (err) {
    if (!isCancellation(err)) {
      throw(err);
    }
  } finally {
    round.finished = true;
  }

  await CancellationScope.nonCancellable(async () => {
    await emit([{ type: 'roundFinished', payload: { round } }]);
  });

  log.info('Round finished', { round });

  return round;
}

type SnakeWorkerWorkflowInput = {
  roundId: string;
  identity: string;
};

export async function SnakeWorkerWorkflow({ roundId, identity }: SnakeWorkerWorkflowInput): Promise<void> {
  const round = getExternalWorkflowHandle(roundId);
  let scope: CancellationScope | undefined;

  setHandler(workerStopSignal, () => {
    if (scope) { scope.cancel() }
  });

  while (true) {
    try {
      scope = new CancellationScope();
      await scope.run(() => snakeWorker(roundId, identity));
    } catch (e) {
      if (isCancellation(e)) {
        // Let workers start again faster for now.
        await sleep(SNAKE_WORKER_DOWN_TIME);
      } else {
        throw e;
      }
    }
  }
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

  const { snakeNom } = proxyActivities<ReturnType <typeof buildGameActivities>>({
    startToCloseTimeout: nomDuration * 2,
    taskQueue: 'game',
    retry: {
      initialInterval: 1,
      backoffCoefficient: 1,
    }
  });

  const round = getExternalWorkflowHandle(roundId);
  const noms = Array.from({ length: nomsPerMove });
  let moves = 0;

  while (true) {
    await Promise.all(noms.map(() => snakeNom(id, nomDuration)));
    try {
      await round.signal(snakeMoveSignal, id, direction);
    } catch (err) {
      log.info('Cannot signal round, exiting');
      break;
    }
    if (moves++ > SNAKE_MOVES_BEFORE_CAN) {
      await continueAsNew<typeof SnakeWorkflow>({ roundId, id, direction, nomsPerMove, nomDuration });
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
  if (snakeAt(round, newHead)) {
    // Truncate the snake to just the head, and ignore the requested move
    headSegment.length = 1;
    snake.segments = [headSegment];
    return;
  }

  // Check if we've hit an apple
  const appleId = appleAt(round, newHead);
  if (appleId !== undefined) {
    // Snake ate an apple, set appleId
    snake.ateAppleId = appleId;
    tailSegment.length += 1;  // Grow the snake by increasing the tail length
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

function appleAt(round: Round, point: Point): string | undefined {
  for (const [id, apple] of Object.entries(round.apples)) {
    if (apple.x === point.x && apple.y === point.y) {
      return id;
    }
  }
  return undefined;
}

function calculatePosition(segment: Segment): { t: number, l: number, b: number, r: number } {
  const { direction, head: start, length } = segment;
  let [t, b] = [start.y, start.y];
  let [l, r] = [start.x, start.x];

  if (direction === 'up') {
    b = t + (length - 1);
  } else if (direction === 'down') {
    t = b - (length - 1);
  } else if (direction === 'left') {
    r = l + (length - 1);
  } else {
    l = r - (length - 1);
  }

  return { t, l, b, r };
}

function snakeAt(round: Round, point: Point): Snake | undefined {
  for (const snake of Object.values(round.snakes)) {
    for (const segment of snake.segments) {
      const pos = calculatePosition(segment);

      if (point.x >= pos.l && point.x <= pos.r && point.y >= pos.t && point.y <= pos.b) {
        return snake;
      }
    }
  }

  return undefined;
}

function randomEmptyPoint(round: Round): Point {
  let point = { x: Math.ceil(Math.random() * round.config.width), y: Math.ceil(Math.random() * round.config.height) };
  // Check if any apple is at the point
  while (appleAt(round, point) || snakeAt(round, point)) {
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

async function startWorkerManagers(count: number) {
  const snakeWorkerManagers = Array.from({ length: count }).map((_, i) => {
    const identity = `snake-worker-${i + 1}`;
    return startChild(SnakeWorkerWorkflow, {
      workflowId: identity,
      args: [{ roundId: ROUND_WF_ID, identity }],
    });
  })
  try {
    await Promise.all(snakeWorkerManagers);
  } catch (err) {
    log.error('Failed to start worker managers', { error: err });
    throw(err);
  }
}

async function startSnakeTrackers(snakes: Snakes) {
  for (const snake of Object.values(snakes)) {
    snakeTracker(snake.id);
  }
}

async function startSnakes(config: GameConfig, snakes: Snakes) {
  const commands = Object.values(snakes).map((snake) =>
    startChild(SnakeWorkflow, {
      workflowId: snake.id,
      taskQueue: 'snakes',
      workflowTaskTimeout: '2 seconds',
      args: [{
        roundId: ROUND_WF_ID,
        id: snake.id,
        direction: snake.segments[0].direction,
        nomsPerMove: config.nomsPerMove,
        nomDuration: config.nomDuration,
      }]
    })
  )

  try {
    await Promise.all(commands);
  } catch (err) {
    log.error('Failed to start snakes', { error: err });
    throw(err);
  }
}

function randomizeRound(round: Round) {
  for (const snake of Object.values(round.snakes)) {
    snake.segments = [
      { head: randomEmptyPoint(round), direction: randomDirection(), length: 1 }
    ]
  }
}
