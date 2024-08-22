// import { Server } from 'socket.io';
// import { gameState, updateGameState, addPlayer, removePlayer } from '$lib/game';


import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Direction } from '$lib/snake/types.js';

const TEMPORAL_ADDRESS = env.TEMPORAL_ADDRESS;
const TEMPORAL_NAMESPACE = env.TEMPORAL_NAMESPACE;
const TEMPORAL_TASK_QUEUE = env.TEMPORAL_TASK_QUEUE;
const TEMPORAL_WORKFLOW_TYPE = env.TEMPORAL_WORKFLOW_TYPE;
const TEMPORAL_PLAYER_WORKFLOW_TYPE = env.TEMPORAL_PLAYER_WORKFLOW_TYPE;

const workflowsUrl = `${TEMPORAL_ADDRESS}/api/v1/namespaces/${TEMPORAL_NAMESPACE}/workflows`;

type GameAction = {
	action: 'startGame' | 'startRound' | 'move' | 'queryState';
	workflowId: string;
	input: GameInput;
	numSpaces: number;
};

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { action, name, team, workflowId, gameWorkflowId, duration, input, direction } = body;

		switch (action) {
			case 'playerRegister':
				return await playerRegister(name);
			case 'playerJoin':
				return await playerJoin(workflowId, gameWorkflowId, team);
			case 'startGame':
				return await startGame(input);
			case 'startRound':
				return await startRound(duration, workflowId);
			case 'moveSnake':
				return await signalSnakeMove(workflowId, direction);
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


async function startGame(input: GameInput) {
	console.log('Starting game with input:', input);
	const workflowId = `game-${Date.now()}`;
	const response = await fetch(`${workflowsUrl}/${workflowId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			workflowType: { name: TEMPORAL_WORKFLOW_TYPE },
			taskQueue: { name: TEMPORAL_TASK_QUEUE },
			input: [input]
		})
	});

	console.log('Start Game Response: ', response);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json({ workflowId, runId: result.runId });
}

async function startRound(duration: number, workflowId: string) {
	console.log('Starting round with duration:', duration);
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

async function signalSnakeMove(workflowId: string, direction: Direction) {
	const signalName = 'snakeChangeDirection'
	const response = await fetch(`${workflowsUrl}/${workflowId}/signal/${signalName}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			workflowExecution: { workflowId },
			signalName,
			input: [direction]
		})
	});

	console.log('Signal Snake Move Response: ', response);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const result = await response.json();
	return json({ workflowId, runId: result.runId });
}

async function snakeMoved(snake: Snake) {

	// SSE?
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
