import { Snake, Round } from './workflows';
import { request, Agent } from 'undici';

const agent = new Agent({
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
});

export async function snakeWork(durationMs: number) {
    // sleep for duration
    await new Promise((resolve) => setTimeout(resolve, durationMs));
}

export async function snakeMovedNotification(snake: Snake) {
    await request(`http://localhost:5173/api/signal`, {
        dispatcher: agent,
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
    await request(`http://localhost:5173/api/game`, {
        dispatcher: agent,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'roundUpdate',
            round: { ...round, stale: undefined },
        })
    });
}