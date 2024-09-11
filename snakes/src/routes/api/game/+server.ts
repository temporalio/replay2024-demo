import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { Connection, Client } from '@temporalio/client';

const TEMPORAL_GRPC_ADDRESS = env.TEMPORAL_GRPC_ADDRESS;
const TEMPORAL_ADDRESS = env.TEMPORAL_ADDRESS;
const TEMPORAL_NAMESPACE = env.TEMPORAL_NAMESPACE;
const TEMPORAL_TASK_QUEUE = env.TEMPORAL_TASK_QUEUE;
const TEMPORAL_WORKFLOW_TYPE = env.TEMPORAL_WORKFLOW_TYPE;

const workflowsUrl = `http://${TEMPORAL_ADDRESS}/api/v1/namespaces/${TEMPORAL_NAMESPACE}/workflows`;

console.log('TEMPORAL_ADDRESS:', TEMPORAL_ADDRESS);
console.log('TEMPORAL_NAMESPACE:', TEMPORAL_NAMESPACE);
console.log(workflowsUrl);

const connection = await Connection.connect({
    address: TEMPORAL_GRPC_ADDRESS, // as provisioned
  });

const temporal = new Client({
    connection,
    namespace: TEMPORAL_NAMESPACE, // change if you have a different namespace
  });

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { action, input } = body;

		switch (action) {
			case 'terminateGame':
				return await terminateGame();
			case 'startGame':
				return await startGame(input);
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
	await temporal.workflow.getHandle('SnakeGame').terminate('Game Over');
	return json({ });
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
