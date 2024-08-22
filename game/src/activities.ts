import { Snake, Round } from './workflows';

export async function snakeWork(durationMs: number) {
    // sleep for duration
    await new Promise((resolve) => setTimeout(resolve, durationMs));
}

export async function snakeMovedNotification(snake: Snake) {
    await fetch(`http://localhost:5173/api/game`, {
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

export async function roundUpdateNotification(round: Round) {
    await fetch(`http://localhost:5173/api/game`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'roundUpdate',
            round: round,
        })
    });
}