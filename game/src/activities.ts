import { Snake, Round } from './workflows';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5173');
const lobbySocket = io('http://localhost:5173/lobby');

export async function snakeNom(snakeId: string, durationMs: number) {
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    socket.emit('snakeNom', { snakeId });
}

export async function snakeMovedNotification(snake: Snake) {
    socket.emit('snakeMoved', { snakeId: snake.id, segments: snake.segments });
}

export async function roundStartedNotification(round: Round) {
    socket.emit('roundStarted', { round });
}

export async function roundUpdateNotification(round: Round) {
    socket.emit('roundUpdate', { round });
}

export async function roundFinishedNotification(round: Round) {
    socket.emit('roundFinished', { round });
}
