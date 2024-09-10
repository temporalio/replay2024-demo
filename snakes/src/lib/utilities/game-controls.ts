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

const input = {
  width: 25,
  height: 25,
  snakesPerTeam: 1,
  teamNames: ['red', 'blue', 'orange'],
  nomsPerMove: 1,
  nomDuration: 250,
  killWorkers: false,
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
