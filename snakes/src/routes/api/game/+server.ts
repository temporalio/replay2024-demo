import { Server } from 'socket.io';
import type { RequestHandler } from '@sveltejs/kit';
import { gameState, updateGameState, addPlayer, removePlayer } from '$lib/game';

export const GET: RequestHandler = ({ request }) => {
  const io = new Server();
  io.attach(request.socket.server);

  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    addPlayer(socket.id);

    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
      removePlayer(socket.id);
    });

    socket.on('move', (direction: string) => {
      const player = gameState.players[socket.id];
      if (player) {
        player.direction = direction;
      }
    });
  });

  setInterval(() => {
    updateGameState();
    io.emit('gameState', gameState);
  }, 100);

  return new Response(null, { status: 200 });
};
