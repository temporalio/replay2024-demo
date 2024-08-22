import { Snake } from './workflows';

export async function snakeWork(durationMs: number) {
    // sleep for duration
    await new Promise((resolve) => setTimeout(resolve, durationMs));
}

export async function snakeMovedNotification(snake: Snake) {
    await fetch(`http://localhost:5173/api/signal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'snakeMoved',
            snake: snake,
        })
    });
}