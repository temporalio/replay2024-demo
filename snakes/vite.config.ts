import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { Server } from 'socket.io';
import { Client } from '@temporalio/client';

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);
		globalThis.io = io;
		const temporal = new Client();

		io.on('connection', (socket) => {
			socket.on('snakeChangeDirection', async (id, direction) => {
				try {
					await temporal.workflow.getHandle(id).signal('snakeChangeDirection', direction);
				} catch (err) {
					console.error(err);
				}
			});
			socket.on('snakeNom', (id) => {
				io.emit('snakeNom', id);
			});
			socket.on('snakeMoved', (id, segments) => {
				io.emit('snakeMoved', id, segments);
			});
			socket.on('roundUpdate', (roundUpdate) => {
				io.emit('roundUpdate', roundUpdate);
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
});
