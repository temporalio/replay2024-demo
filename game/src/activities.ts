import { Snake } from './workflows';
import fetch from 'node-fetch';

export async function snakeWork(durationMs: number) {
    // sleep for duration
    await new Promise((resolve) => setTimeout(resolve, durationMs));
}

export async function snakeMovedNotification(snake: Snake) {
    await fetch(`http://localhost:1234/snake/${snake.id}/moved`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(snake.segments),
    });
}