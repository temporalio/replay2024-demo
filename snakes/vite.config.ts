import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { Server } from 'socket.io';

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);
		globalThis.io = io;
		io.on('connection', (socket) => {
			socket.on('snakeMoved', (snake) => {
				io.emit('snakeMoved', snake);
			});
			socket.on('roundUpdate', (round) => {
				io.emit('roundUpdate', round);
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
});
