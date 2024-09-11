import { io } from 'socket.io-client';
import { Worker, NativeConnection } from '@temporalio/worker';
import { heartbeat, cancelled } from '@temporalio/activity';

const workflowBundleOptions = () =>
  process.env.NODE_ENV === 'production'
    ? {
        workflowBundle: {
          codePath: require.resolve('../workflow-bundle.js'),
        },
      }
    : { workflowsPath: require.resolve('./workflows') };

export function buildWorkerActivities(namespace: string, connection: NativeConnection, socketHost: string) {
  const workerSocket = io(`${socketHost}/workers`);
  workerSocket.on('connect_error', (err) => {
    console.log('snake worker host socket connection error', err);
  });

  return {
    snakeWorker: async (identity: string) => {
      const worker = await Worker.create({
        connection,
        namespace,
        ...workflowBundleOptions(),
        taskQueue: 'snakes',
        activities: buildGameActivities(socketHost),
        identity,
        stickyQueueScheduleToStartTimeout: 250,
      })

      const heartbeater = setInterval(heartbeat, 1000);

      worker.numRunningWorkflowInstances$.subscribe((count) => {
        workerSocket.emit('worker:workflows', { identity, count });
      });

      try {
        workerSocket.emit('worker:start', { identity });
        await worker.runUntil(cancelled())
      } finally {
        workerSocket.emit('worker:stop', { identity });
        clearInterval(heartbeater);
      }
    },
  }
}

export type Event = {
  type: 'snakeMoved' | 'roundLoading' | 'roundStarted' | 'roundUpdate' | 'roundFinished';
  payload: any;
};

export function buildGameActivities(socketHost: string) {
  const socket = io(socketHost);
  socket.on('connect_error', (err) => {
    console.log('game activity socket connection error', err);
  });

  return {
    emit: async function(events: Event[]) {
      for (const event of events) {
        socket.emit(event.type, event.payload);
      }
    },
    snakeNom: async function(snakeId: string, durationMs: number) {
      await new Promise((resolve) => setTimeout(resolve, durationMs));
      socket.emit('snakeNom', { snakeId });
    }
  }
};
