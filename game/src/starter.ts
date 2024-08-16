import { Client } from '@temporalio/client';
import { GameWorkflow, roundStartUpdate, gameTickUpdate } from './workflows';

export async function runWorkflows(client: Client, taskQueue: string, numWorkflows: number): Promise<void> {
  const handle = await client.workflow.start(GameWorkflow, {
    args: [{width: 100, height: 100, teams: ['red', 'blue'], playersPerTeam: 2}],
    taskQueue,
    workflowId: `game-${Date.now()}`
  });

  console.log(`Started workflow ${handle.workflowId}`);

  const round = await handle.executeUpdate(roundStartUpdate, { args: [10] });
  console.log(`Started round with snakes: ${round.snakes.map((snake) => snake.id).join(', ')}`);

  const snakes = round.snakes.map((snake) => client.workflow.getHandle(snake.id));
  // await snakes[0].signal(snakeMove, 'up').then(() => snakes[0].signal(snakeMove, 'left'))
  // await snakes[1].signal(snakeMove, 'down').then(() => snakes[1].signal(snakeMove, 'right'))

  let finished = false;

  while (!finished) {
    const tick = await handle.executeUpdate(gameTickUpdate);
    console.log(`Tick: ${JSON.stringify(tick)}`);
    finished = tick.finished;
  }
  console.log(`Round ended`);
  
  console.log('Sending finish signal');
  await handle.signal('gameFinished');

  await handle.result();
}
