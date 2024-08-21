import { Client } from '@temporalio/client';
import { GameWorkflow, PlayerWorkflow, roundStartUpdate, snakeChangeDirectionSignal, playerWaitForRoundUpdate, playerJoinTeamUpdate } from './workflows';

export async function runWorkflows(client: Client, taskQueue: string, numWorkflows: number): Promise<void> {
  // Players can be created at any time. They will wait for a game to start if one is not active.
  const playerHandles = await Promise.all(
    Array.from({ length: 4 }).map(
      (_, i) => client.workflow.start(PlayerWorkflow, { taskQueue, workflowId: `player-${i}`})
    )
  );

  // Main UI will create a game with a config
  const gameHandle = await client.workflow.start(GameWorkflow, {
    args: [{width: 10, height: 10, teams: ['red', 'blue'], snakesPerTeam: 2}],
    taskQueue,
    workflowId: `game-${Date.now()}`
  });

  console.log(`Started game ${gameHandle.workflowId}`);

  // Player UI will discover game (via ListWorkflow API?) and join
  const playerTeamJoins = [
    playerHandles[0].executeUpdate(playerJoinTeamUpdate, { args: [gameHandle.workflowId, 'red'] }),
    playerHandles[1].executeUpdate(playerJoinTeamUpdate, { args: [gameHandle.workflowId, 'red'] }),
    playerHandles[2].executeUpdate(playerJoinTeamUpdate, { args: [gameHandle.workflowId, 'blue'] }),
    playerHandles[3].executeUpdate(playerJoinTeamUpdate, { args: [gameHandle.workflowId, 'blue'] }),
  ];
  await Promise.all(playerTeamJoins);

  console.log('Players joined teams');

  // Player UI will block on playerWaitForRoundUpdate to wait for a round to start.
  const playerSnakeAllocations = playerHandles.map((handle) => handle.executeUpdate(playerWaitForRoundUpdate));

  const round = await gameHandle.executeUpdate(roundStartUpdate, { args: [10] });

  console.log('Round started', round);

  // Round started, UI will redirect to the snake controls for the snake they received from playerWaitForRoundUpdate response.
  const snakesIds = await Promise.all(playerSnakeAllocations);
  
  // UI Snake controls will send signals to the snake workflow to change direction.
  const snakeHandles = snakesIds.map((id) => client.workflow.getHandle(id));
  await snakeHandles[0].signal(snakeChangeDirectionSignal, 'left').then(() => snakeHandles[0].signal(snakeChangeDirectionSignal, 'up'));
  await snakeHandles[1].signal(snakeChangeDirectionSignal, 'right').then(() => snakeHandles[1].signal(snakeChangeDirectionSignal, 'down'));
  
  // Round will finish via timer on the workflow
  // TODO: Figure out how UI will know when the round is finished

  // Once all rounds are played, tell the workflow that we're done.
  // This may trigger some summaries, or something.

  console.log('Sending finish signal');
  await gameHandle.signal('gameFinished');

  // Once we tell the game it's finished, it will complete.
  await gameHandle.result();
}
