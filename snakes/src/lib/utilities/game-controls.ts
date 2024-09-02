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
  teamNames: ['red', 'blue']
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

export const demoPlayersJoin = async (socket: Socket) => {
  const joins = [];
  for (let i = 0; i < demoPlayers.length; i++) {
    const join = socket.emitWithAck('playerJoin', {
      id: demoPlayers[i],
      name: demoPlayers[i],
      teamName: i % 2 == 0 ? 'blue' : 'red'
    });
    joins.push(join);
  }
  await Promise.all(joins);
}
