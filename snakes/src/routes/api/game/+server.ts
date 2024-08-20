// import { Server } from 'socket.io';
// import { gameState, updateGameState, addPlayer, removePlayer } from '$lib/game';

// export const GET: RequestHandler = ({ request }) => {
//   const io = new Server();
//   io.attach(request.socket.server);

//   io.on('connection', (socket) => {
//     console.log('a user connected:', socket.id);
//     addPlayer(socket.id);

//     socket.on('disconnect', () => {
//       console.log('user disconnected:', socket.id);
//       removePlayer(socket.id);
//     });

//     socket.on('move', (direction: string) => {
//       const player = gameState.players[socket.id];
//       if (player) {
//         player.direction = direction;
//       }
//     });
//   });

//   setInterval(() => {
//     updateGameState();
//     io.emit('gameState', gameState);
//   }, 100);

//   return new Response(null, { status: 200 });
// };

import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  console.log("Body:", body);
  try {
    const newGame = await fetch(`http://localhost:7234/api/v1/namespaces/${body.namespace}/workflows/${body.workflowId}`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    console.log('Started game:', newGame);
  } catch (e) {
    console.log("FAILED: ", e)
  }
  return new Response(null, { status: 200 });  
}