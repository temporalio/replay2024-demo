import {
  proxyActivities, defineSignal, setHandler, condition, defineUpdate,
  log, startChild, workflowInfo, sleep
} from '@temporalio/workflow';

import type * as activities from './activities';

const TICK_DURATION = 100;

const { square } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 seconds',
  retry: { nonRetryableErrorTypes: ['CreditCardExpiredException'] }
});

type Game = {
  width: number;
  height: number;
  teams: string[];
  playersPerTeam: number;
};

type Round = {
  teams: string[];
  snakes: Snake[];
  duration: number;
}

type Apple = {
  x: number;
  y: number;
}

type Path = {
  x: number;
  y: number;
  direction: string;
  length: number;
  previous: Path | null;
}

type Tick = {
  apple: Apple | null;
  snakes: Record<string, Path>;
  scores: Record<string, number>;
  finished: boolean;
}

type Snake = {
  team: string;
  id: string;
}

export const roundStartUpdate = defineUpdate<Round, [number]>('roundStart');
export const gameTickUpdate = defineUpdate<Tick>('gameTick');
export const gameFinishedSignal = defineSignal('gameFinished');

export const snakeMoveUpdate = defineUpdate<boolean, [string]>('snakeMove');

export async function GameWorkflow(game: Game): Promise<void> {
  log.info('Starting game');

  // log.debug('Creating teams');
  // const teams = await Promise.all(game.teams.map((team) => startChild(TeamWorkflow, { args: [team] })));

  let finished = false;
  let roundInProgress = false;
  let roundDuration = 0;

  setHandler(roundStartUpdate, async (duration): Promise<Round> => {
    let snakes = game.teams.flatMap((team) => {
      return Array.from({ length: game.playersPerTeam }).map((_, i) => {
        return { team }
      });
    });

    const wfs = await Promise.all(snakes.map((snake) => startChild(SnakeWorkflow, { args: [snake.team] })));
    
    roundDuration = duration;
    roundInProgress = true;

    return {
      duration,
      teams: game.teams,
      snakes: snakes.map((snake, i) => { return { team: snake.team, id: wfs[i].workflowId } }),
    };
  }, { validator: (_) => { if (roundInProgress) { throw new Error('Round already in progress'); } } });

  setHandler(gameTickUpdate, async () => {
    log.info('Game tick');

    return {
      apple: null,
      snakes: {},
      scores: {},
      finished: !roundInProgress,
    };
  });

  setHandler(gameFinishedSignal, async () => {
    finished = true;
  });

  while (true) {
    log.info('Waiting for round to start');
    await condition(() => finished || roundInProgress);
    if (finished) { break; }
    log.info('Starting round timer');
    await sleep(roundDuration * 1000);
    log.info('Round ended');
    roundInProgress = false;
  }

  log.info('Finished game');
}

export async function SnakeWorkflow(team: string): Promise<void> {
  log.info('Created snake', { team });

  const id = workflowInfo().workflowId;

  // setHandler(snakeMove, (direction) => {
  //   log.info('Moving snake', { team, id, direction });
  // });

  await condition(() => false);
}
