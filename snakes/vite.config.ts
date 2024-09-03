import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { Server } from 'socket.io';
import { Client } from '@temporalio/client';
import type { Lobby, Round } from '$lib/snake/types';

const GAME_WORKFLOW_ID = 'SnakeGame';

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);
		globalThis.io = io;
		const temporal = new Client();

		io.on('connection', (socket) => {
			// Game -> Player UI
			socket.on('playerInvitation', ({ playerId, snakeId }) => {
				io.to(`player-${playerId}`).emit('playerInvitation', { snakeId });
			});

			socket.on('roundStarted', ({ round }) => {
				io.emit('roundStarted', { round });
			});
			socket.on('roundUpdate', ({ round }) => {
				io.emit('roundUpdate', { round });
			});
			socket.on('roundFinished', ({ round }) => {
				io.emit('roundFinished', { round });
			});

			socket.on('snakeNom', ({ snakeId }) => {
				io.emit('snakeNom', { snakeId });
			});
			socket.on('snakeMoved', ({ snakeId, segments }) => {
				io.emit('snakeMoved', { snakeId, segments });
			});

			socket.on('lobby', ({ lobby }) => {
				io.emit('lobby', { lobby });
			});

			// Player UI -> Game
			socket.on('roundStart', async ({ duration }) => {
				try {
					await temporal.workflow.getHandle(GAME_WORKFLOW_ID).signal('roundStart', { duration });
				} catch (err) {
					console.error(err);
				}
			});

			socket.on('fetchRound', async () => {
				try {
					const round = await temporal.workflow.getHandle('SnakeGameRound').query<Round>('roundState');
					if (round && !round.finished) {
						socket.emit('roundStarted', { round });
					} else {
						socket.emit('roundNotFound');
					}
				} catch (err) {
					socket.emit('roundNotFound');
				}
			});

			socket.on('fetchLobby', async () => {
				try {
					const lobby = await temporal.workflow.getHandle(GAME_WORKFLOW_ID).query<Lobby>('lobby');
					socket.emit('lobby', { lobby });
				} catch (err) {
					console.error(err);
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
				} catch (err) {
					console.error(err);
				}
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
});
