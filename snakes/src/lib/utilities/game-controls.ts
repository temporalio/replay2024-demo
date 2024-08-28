
const demoPlayers = ['Alex', 'Rob', 'Candace', 'Laura'];

function wait(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export const startGame = async () => {
  await terminateGame();
  await wait(1000)
  const workflowId = await startNewGame();
  return workflowId;
}

export const startTestRound = async (workflowId: string) => {
  await playersRegister(workflowId);
  await playersJoin(workflowId);
  return await startRound(workflowId);
}

export const startDemoGame = async () => {
  await terminateGame();
  await wait(1000)
  const workflowId = await startNewGame()
  await playersRegister(workflowId);
  await playersJoin(workflowId);
  return await startRound(workflowId);
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
  width: 50,
  height: 25,
  snakesPerTeam: 2,
  teams: ['red', 'blue']
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

const playerRegisters = async (name: string, workflowId: string) => {
  await fetch('/api/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'playerRegister', name, workflowId })
  });
};

const playersRegister = async (workflowId: string) => {
  for (const name of demoPlayers) {
    await playerRegisters(name, workflowId);
  }
};

const playerJoins = async (name: string, team: string, workflowId: string) => {
  await fetch('/api/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'playerJoin', workflowId: `player-${name}`, gameWorkflowId: workflowId, team })
  });
};

const playersJoin = async (workflowId: string) => {
  for (const [i, name] of demoPlayers.entries()) {
    await playerJoins(name, i < 2 ? 'blue' : 'red', workflowId);
  }
};

const startRound = async (workflowId: string) => {
  const response = await fetch('/api/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'startRound', duration: 60, workflowId })
  });
  const { result } = await response.json();
  return { result, workflowId };
};
