// import { Server } from 'socket.io';
// import { gameState, updateGameState, addPlayer, removePlayer } from '$lib/game';

import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const TEMPORAL_ADDRESS = env.TEMPORAL_ADDRESS;
const TEMPORAL_NAMESPACE = env.TEMPORAL_NAMESPACE;
const TEMPORAL_TASK_QUEUE = env.TEMPORAL_TASK_QUEUE;
const TEMPORAL_WORKFLOW_TYPE = env.TEMPORAL_WORKFLOW_TYPE;
const TEMPORAL_PLAYER_WORKFLOW_TYPE = env.TEMPORAL_PLAYER_WORKFLOW_TYPE;

const workflowsUrl = `${TEMPORAL_ADDRESS}/api/v1/namespaces/${TEMPORAL_NAMESPACE}/workflows`;
const batchUrl = `${TEMPORAL_ADDRESS}/api/v1/namespaces/${TEMPORAL_NAMESPACE}/batch-operations`;

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { action, name, team, workflowId, gameWorkflowId, duration, input } = body;

		switch (action) {
			case 'terminateGame':
				return await terminateGame();
			case 'startGame':
				return await startGame(input);
			case 'playerRegister':
				return await playerRegister(name);
			case 'playerJoin':
				return await playerJoin(workflowId, gameWorkflowId, team);
			case 'startRound':
				return await startRound(duration, workflowId);
			case 'queryState':
				return await queryGameState(workflowId);
			default:
				return json({ error: 'Invalid action' }, { status: 400 });
		}
	} catch (error: any) {
		console.error('Error processing request:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

type Team = {
	name: string;
};

type GameInput = {
	width: number;
	height: number;
	snakesPerTeam: number;
	teams: Team[];
};

async function terminateGame() {
	const jobId = Date.now().toString();
	const response = await fetch(`${batchUrl}/${jobId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			namespace: TEMPORAL_NAMESPACE,
			jobId,
			visibilityQuery: "ExecutionStatus='Running'",
			reason: 'Game Over',
			terminationOperation: { },
		})
	});

	if (!response.ok) {
		const text = await response.text();
		console.log("NOT TERMINATING!",  text)
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json({ result });
}

async function startGame(input: GameInput) {
	const workflowId = 'SnakeGame';
	const response = await fetch(`${workflowsUrl}/${workflowId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			workflowType: { name: TEMPORAL_WORKFLOW_TYPE },
			taskQueue: { name: TEMPORAL_TASK_QUEUE },
			input: [input]
		})
	});

	if (!response.ok) {
		const error = await response.text();
		console.log('Error Starting Game: ', error);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json({ workflowId, runId: result.runId });
}

async function playerRegister(name: string) {
	console.log('Player Joining:', name);
	const workflowId = `player-${name}`;
	const response = await fetch(`${workflowsUrl}/${workflowId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			namespace: TEMPORAL_NAMESPACE,
			workflowType: { name: TEMPORAL_PLAYER_WORKFLOW_TYPE },
			taskQueue: { name: TEMPORAL_TASK_QUEUE }
		})
	});

	if (!response.ok) {
		const error = await response.text();
		console.log('Error: ', error);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json(result);
}

async function playerJoin(workflowId: string, gameWorkflowId: string, team: string) {
	const updateName = 'playerJoinTeam';
	const response = await fetch(`${workflowsUrl}/${workflowId}/update/${updateName}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			namespace: TEMPORAL_NAMESPACE,
			workflowExecution: { workflowId },
			waitPolicy: { lifecycleStage: 'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_COMPLETED' },
			request: {
				meta: { updateId: 'join-team' },
				input: {
					name: updateName,
					args: {
						payloads: [gameWorkflowId, team]
					}
				}
			}
		})
	});

	if (!response.ok) {
		const error = await response.text();
		console.log('Error: ', error);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json({ result });
}

async function startRound(duration: number, workflowId: string) {
	const updateName = 'roundStart';
	const response = await fetch(`${workflowsUrl}/${workflowId}/update/${updateName}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			namespace: TEMPORAL_NAMESPACE,
			workflowExecution: { workflowId },
			waitPolicy: { lifecycleStage: 'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_COMPLETED' },
			request: {
				meta: { updateId: 'begin-round' },
				input: {
					name: updateName,
					args: {
						payloads: [duration]
					}
				}
			}
		})
	});

	if (!response.ok) {
		const error = await response.text();
		console.log('Error: ', error);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json({ result });
}

async function queryGameState(workflowId: string) {
	const queryName = 'gameState';
	const response = await fetch(`${workflowsUrl}/${workflowId}/query/${queryName}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			namespace: TEMPORAL_NAMESPACE,
			execution: { workflowId },
			query: {
				queryType: queryName
			}
		})
	});

	if (!response.ok) {
		const error = await response.text();
		console.log('Error: ', error);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json(result.queryResult);
}
