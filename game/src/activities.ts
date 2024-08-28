import { Snake, Round } from './workflows';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5173');

export async function snakeNom(snake: Snake, durationMs: number) {
    // sleep for duration
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    socket.emit('snakeNom', snake.id);
}

export async function snakeMovedNotification(snake: Snake) {
    socket.emit('snakeMoved', snake.id, snake.segments);
}

export async function roundUpdateNotification(round: Round) {
    socket.emit('roundUpdate', { apple: round.apple, teams: round.teams, finished: round.finished });
}