import { Client } from '@temporalio/client';
import { GameWorkflow, roundStartUpdate, snakeChangeDirectionSignal } from './workflows';

export async function runWorkflows(client: Client, taskQueue: string, numWorkflows: number): Promise<void> {
  const handle = await client.workflow.start(GameWorkflow, {
    args: [{width: 10, height: 10, teams: ['red', 'blue'], snakesPerTeam: 2}],
    taskQueue,
    workflowId: `game-${Date.now()}`
  });

  console.log(`Started workflow ${handle.workflowId}`);

  const round = await handle.executeUpdate(roundStartUpdate, { args: [10] });
  console.log(`Started round with snakes: ${round.snakes.map((snake) => snake.id).join(', ')}`);

  const snakes = round.snakes.map((snake) => client.workflow.getHandle(snake.id));
  await snakes[0].signal(snakeChangeDirectionSignal, 'left').then(() => snakes[0].signal(snakeChangeDirectionSignal, 'up'));
  await snakes[1].signal(snakeChangeDirectionSignal, 'right').then(() => snakes[1].signal(snakeChangeDirectionSignal, 'down'));
  
  console.log('Sending finish signal');
  await handle.signal('gameFinished');

  await handle.result();
}
