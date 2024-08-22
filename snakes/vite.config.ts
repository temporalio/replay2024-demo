import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { Server } from 'socket.io';

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);
		globalThis.io = io;
		io.on('connection', (connection) => {
			connection.emit('eventFromServer', '✅ Connected');
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
});
