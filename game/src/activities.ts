import { Snake, Round } from './workflows';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5173');

export async function snakeWork(durationMs: number) {
    // sleep for duration
    await new Promise((resolve) => setTimeout(resolve, durationMs));
}

export async function snakeMovedNotification(snake: Snake) {
    socket.emit('snakeMoved', snake);
}

export async function roundUpdateNotification(round: Round) {
    socket.emit('roundUpdate', { ...round, stale: undefined });
}