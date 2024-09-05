import { Socket } from 'socket.io-client';

const demoPlayers = ['Alex', 'Rob', 'Candace', 'Laura'];

function wait(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export const startGame = async () => {
  await terminateGame();
  await wait(1000)
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

const input = {
  width: 25,
  height: 25,
  snakesPerTeam: 2,
  teamNames: ['red', 'blue'],
  nomsPerMove: 6,
  nomDuration: 100,
};

const startNewGame = async () => {
  const response = await fetch('/api/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'startGame', input })
  });
  const { workflowId } = await response.json();
  return workflowId;
};
