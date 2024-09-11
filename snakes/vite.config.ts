import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { Server } from 'socket.io';
import { Client, WorkflowNotFoundError } from '@temporalio/client';
import type { GameConfig, Lobby, Round, Snake } from './src/lib/snake/types';
import { createConnection, getEnv } from './src/lib/server/temporal';

const TEMPORAL_WORKFLOW_TYPE = 'GameWorkflow';
const TEMPORAL_TASK_QUEUE = 'game'

const GAME_WORKFLOW_ID = 'SnakeGame';
const ROUND_WORKFLOW_ID = 'SnakeGameRound';
const INVITE_TIMEOUT = 10000;

type SocketLobby = {
	teams: Record<string, LobbyTeam>;
}

type LobbyTeam = {
	players: LobbyPlayers;
	playerCount: number;
}

type LobbyPlayer = {
	id: string;
	sockets: number;
}

type LobbyPlayers = Record<string, LobbyPlayer>;

const addPlayerSocket = (socketLobby: SocketLobby, id: string, teamName: string): boolean => {
	let playerAdded = false;

	let team = socketLobby.teams[teamName];
	if (!team) {
		console.log(`Creating team ${teamName}`);
		team = socketLobby.teams[teamName] = { players: {}, playerCount: 0 };
	}
	let player = team.players[id];
	if (!player) {
		console.log(`Creating player ${id} in team ${teamName}`);
		player = team.players[id] = { id, sockets: 0 };
		team.playerCount++;
		playerAdded = true;
	}
	player.sockets += 1;

	return playerAdded;
}

const removePlayerSocket = (socketLobby: SocketLobby, id: string, teamName: string): boolean => {
	let playerRemoved = false;

	const team = socketLobby.teams[teamName];
	const player = team.players[id];
	player.sockets -= 1;
	if (player.sockets === 0) {
		console.log(`Removing player ${id} in team ${teamName}`);
		delete team.players[id];
		team.playerCount--;
		playerRemoved = true;
	}

	return playerRemoved;
}

const lobbySummary = (socketLobby: SocketLobby): Lobby => {
	const lobby: Lobby = { teams: {}};

	for (const teamName of Object.keys(socketLobby.teams)) {
		lobby.teams[teamName] = {
			name: teamName,
			players: socketLobby.teams[teamName].playerCount,
			score: 0,
		};
	}

	return lobby
}

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);
		globalThis.io = io;
		const clientEnv = getEnv();
		const temporal = new Client({
			namespace: clientEnv.namespace,
			connection: createConnection(clientEnv)
		});

		const socketLobby: SocketLobby = { teams: {} };

		const lobbyIO = io.of("/lobby");

		lobbyIO.on('connection', (socket) => {
			const id: string = socket.handshake.auth.id;
			const team: string = socket.handshake.auth.team;

			if (id && team) {
				socket.data.id = id;
				socket.data.team = team;

				socket.join(`player-${id}`);
				socket.join(`team-${team}`);

				if (addPlayerSocket(socketLobby, id, team)) {
					lobbyIO.emit('lobby', { lobby: lobbySummary(socketLobby) });
				} else {
					socket.emit('lobby', { lobby: lobbySummary(socketLobby) });
				}
			} else {
				lobbyIO.emit('lobby', { lobby: lobbySummary(socketLobby) });
			}

			socket.on('findPlayers', async ({ teams, playersPerTeam }: { teams: string[], playersPerTeam: number }, cb) => {
				const playersInvites = teams.map((team) => {
					return new Promise<string[]>((resolve) => {
						lobbyIO.to(`team-${team}`).timeout(INVITE_TIMEOUT).emit('roundInvite', (err: any, responses: string[]) => {
							if (err) { console.log('errors', err); }
							resolve(responses);
						});
					});
				})
				const responses = await Promise.all(playersInvites);
				const players: Record<string, string[]> = {};
				responses.forEach((playerIds, i) => { players[teams[i]] = playerIds.slice(0, playersPerTeam); });
				cb(players);
				teams.forEach((team) => { lobbyIO.to(`team-${team}`).emit('roundReady'); });
			});

			socket.on('disconnect', () => {
				const id: string = socket.data.id;
				const team: string = socket.data.team;
				if (!id || !team) {
					return;
				}

				if (removePlayerSocket(socketLobby, id, team)) {
					lobbyIO.emit('lobby', { lobby: lobbySummary(socketLobby) });
				}
			});
		});

		io.on('connection', (socket) => {
			// Game -> Player UI
			socket.on('roundLoading', ({ round }) => {
				io.emit('roundLoading', { round });
			});
			socket.on('roundStarted', ({ round }) => {
				io.emit('roundStarted', { round });
			});
			socket.on('roundUpdate', ({ round }) => {
				io.emit('roundUpdate', { round });
			});
			socket.on('roundFinished', ({ round }: { round: Round }) => {
				io.emit('roundFinished', { round });
				for (const snake of Object.values(round.snakes)) {
					lobbyIO.to(`player-${snake.playerId}`).emit('roundFinished');
				}
			});

			socket.on('snakeNom', ({ snakeId }) => {
				io.emit('snakeNom', { snakeId });
			});
			socket.on('snakeMoved', ({ snakeId, segments }) => {
				io.emit('snakeMoved', { snakeId, segments });
			});

			// Player UI -> Game
			socket.on('roundStart', async ({ duration, snakes }: { duration: number, snakes: Snake[] }) => {
				const game = temporal.workflow.getHandle(GAME_WORKFLOW_ID);
				try {
					console.log('roundStart', { duration, snakes });
					await game.signal('roundStart', { duration, snakes });
				} catch (err) {
					console.error('roundStart error', err);
				}
				for (const snake of snakes) {
					lobbyIO.to(`player-${snake.playerId}`).emit('roundPlaying', { snake });
				}
			});

			socket.on('fetchRound', async () => {
				try {
					const round = await temporal.workflow.getHandle(ROUND_WORKFLOW_ID).query<Round>('roundState');
					if (round && !round.finished) {
						socket.emit('roundLoading', { round });
						socket.emit('roundStarted', { round });
					} else {
						socket.emit('roundNotFound');
					}
				} catch (err) {
					socket.emit('roundNotFound');
				}
			});

			socket.on('playerJoin', ({ id, name, teamName }, cb) => {
				temporal.workflow.getHandle('SnakeGame')
					.signal('playerJoin', { id, name, teamName })
					.then(() => cb())
					.catch((err) => cb(err));
			});

			socket.on('snakeChangeDirection', async ({ id, direction }) => {
				try {
					await temporal.workflow.getHandle(id).signal('snakeChangeDirection', direction);
				} catch { }
			});

			socket.on('gameStart', async ({ config }: { config: GameConfig }, cb) => {
				try {
					const wf = await temporal.workflow.start(
						TEMPORAL_WORKFLOW_TYPE,
						{
							workflowId: GAME_WORKFLOW_ID,
							taskQueue: TEMPORAL_TASK_QUEUE,
							args: [config],
						},
					);
					cb({ workflowId: wf.workflowId });
				} catch (err) {
					console.error('gameStart error', err);
					cb({ error: err });
				}
			});

			socket.on('gameFinish', async (cb) => {
				const game = temporal.workflow.getHandle(GAME_WORKFLOW_ID);
				try {
					await game.signal('gameFinish');
					await game.result();
					cb({});
				} catch (err) {
					if (err instanceof WorkflowNotFoundError) {
						cb({});
					} else {
						console.log('gameFinish error', err);
						cb({ error: err});
					}
				}
			});

			socket.on('reset', async (cb) => {
				try {
					await temporal.workflow.getHandle(GAME_WORKFLOW_ID).terminate();
				} catch { }
				try {
					await temporal.workflowService.deleteWorkflowExecution({ namespace: clientEnv.namespace, workflowExecution: { workflowId: GAME_WORKFLOW_ID } });
				} catch { }
				try {
					await temporal.workflow.getHandle(ROUND_WORKFLOW_ID).terminate();
				} catch { }
				try {
					await temporal.workflowService.deleteWorkflowExecution({ namespace: clientEnv.namespace, workflowExecution: { workflowId: ROUND_WORKFLOW_ID } });
				} catch { }

				cb({});
			});
		});

		const workerIO = io.of("/workers");

		workerIO.on('connection', (socket) => {
			socket.on('worker:booting', ({ identity }) => {
				workerIO.emit('worker:booting', { identity });
			});

			socket.on('worker:start', ({ identity }) => {
				workerIO.emit('worker:start', { identity });
			});

			socket.on('worker:workflows', ({ identity, count }) => {
				workerIO.emit('worker:workflows', { identity, count });
			});

			socket.on('worker:stop', ({ identity }) => {
				workerIO.emit('worker:stop', { identity });
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
});
