import { GAME_CONFIG } from "$lib/snake/constants";

function wait(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export const startGame = async () => {
  await terminateGame();
  await wait(2000)
  return await startNewGame();
}

const terminateGame = async () => {
  await fetch('/api/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'terminateGame' })
  });
}

const startNewGame = async () => {
  const response = await fetch('/api/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'startGame', input: GAME_CONFIG })
  });
  const { workflowId } = await response.json();
  return workflowId;
};
