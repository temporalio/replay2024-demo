import { Snake, Round } from './workflows';
import { io } from 'socket.io-client';
import { Worker, InjectedSinks, NativeConnection } from '@temporalio/worker';
import { heartbeat, cancelled } from '@temporalio/activity';
import { CancellationScope } from '@temporalio/workflow';
import { SocketSinks } from './workflow-interceptors';

const socket = io('http://localhost:5173');

export function buildWorkerActivities(namespace: string, connection: NativeConnection) {
  return {
    snakeWorker: async (identity: string) => {
      const workerSocket = io('http://localhost:5173/workers', {
        auth: { identity }
      });

      const sinks: InjectedSinks<SocketSinks> = {
        emitter: {
          workflowExecute: {
            fn(workflowInfo) {
              try {
                workerSocket.emit('workflow:execute', { identity, workflowInfo });
              } catch (err) {
                console.log('emit failed', err);
              }
            },
            callDuringReplay: true,
          },
          workflowComplete: {
            fn(workflowInfo) {
              try {
                workerSocket.emit('workflow:complete', { identity, workflowInfo });
              } catch (err) {
                console.log('emit failed', err);
              }
            },
            callDuringReplay: false,
          },
        },
      };

      const worker = await Worker.create({
        connection,
        namespace,
        workflowsPath: require.resolve('./workflows'),
        taskQueue: 'snakes',
        activities: { snakeNom },
        identity,
        interceptors: {
          workflowModules: [require.resolve('./workflow-interceptors')],
        },
        sinks,
        stickyQueueScheduleToStartTimeout: '1s',
      })

      const heartbeater = setInterval(heartbeat, 250);

      await worker.runUntil(cancelled())

      console.log('Worker shutdown', { cancelled: CancellationScope.current().consideredCancelled });

      clearInterval(heartbeater);
    },
  }
}

export async function snakeNom(snakeId: string, durationMs: number) {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  socket.emit('snakeNom', { snakeId });
};

export async function snakeMovedNotification(snake: Snake) {
  socket.emit('snakeMoved', { snakeId: snake.id, segments: snake.segments });
};

export async function roundStartedNotification(round: Round) {
  socket.emit('roundStarted', { round });
};

export async function roundUpdateNotification(round: Round) {
  socket.emit('roundUpdate', { round });
};

export async function roundFinishedNotification(round: Round) {
  socket.emit('roundFinished', { round });
};
