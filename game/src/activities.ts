import { io } from 'socket.io-client';
import { Worker, NativeConnection } from '@temporalio/worker';
import { heartbeat, cancelled } from '@temporalio/activity';
import { Client } from '@temporalio/client';
import { temporal } from '@temporalio/proto';
import Long from 'long';
import { workerStartedSignal } from './workflows';

const workflowBundleOptions = () =>
  process.env.NODE_ENV === 'production'
    ? {
        workflowBundle: {
          codePath: require.resolve('../workflow-bundle.js'),
        },
      }
    : { workflowsPath: require.resolve('./workflows') };

export function buildWorkerActivities(namespace: string, client: Client, connection: NativeConnection, socketHost: string) {
  return {
    snakeWorker: async (roundId: string, identity: string) => {
      const heartbeater = setInterval(heartbeat, 200);

      const worker = await Worker.create({
        connection,
        namespace,
        ...workflowBundleOptions(),
        taskQueue: 'snakes',
        activities: buildGameActivities(socketHost),
        identity,
        stickyQueueScheduleToStartTimeout: 200,
      })

      const round = client.workflow.getHandle(roundId);

      try {
        round.signal(workerStartedSignal, { identity }),
        await worker.runUntil(cancelled())
      } finally {
        clearInterval(heartbeater);
      }
    },
  }
}

export function buildTrackerActivities(namespace: string, client: Client, socketHost: string) {
  const socket = io(`${socketHost}`);
  socket.on('connect_error', (err) => {
    console.log('tracker activity socket connection error', err);
  });

  return {
    snakeTracker: async function(snakeId: string) {
      const heartbeater = setInterval(heartbeat, 200);
      let poll = true;
      cancelled().catch(() => poll = false);

      let lastEventId: Long | undefined = undefined;

      while (poll) {
        let nextPageToken: Uint8Array | undefined;
        // Cannot get withAbortSignal to work
        // (node:20824) MaxListenersExceededWarning: Possible EventTarget memory leak detected. 11 abort listeners added to [AbortSignal]. MaxListeners is 10. Use events.setMaxListeners() to increase limit
        // FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
        const history = await client.workflowService.getWorkflowExecutionHistory({
          namespace,
          execution: { workflowId: snakeId },
          waitNewEvent: true,
          nextPageToken
        });
        if (!poll) { break }

        nextPageToken = history.nextPageToken;
        const events = history.history?.events || [];
        for (const event of events) {
          if (event.eventId) {
            if (lastEventId && event.eventId.lte(lastEventId)) {
              continue;
            }
            lastEventId = event.eventId;
          }
          switch (event.eventType) {
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_TASK_STARTED:
              const identity = event.workflowTaskStartedEventAttributes!.identity;
              if (identity) {
                socket.emit('worker:execution', { identity, snakeId });
              }
              break;
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT:
              socket.emit('worker:timeout', { snakeId });
              break;
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW:
              lastEventId = undefined;
              nextPageToken = undefined;
              break;
          }
        }
      }
      clearInterval(heartbeater);
    },
  }
}

export type Event = {
  type: 'snakeMoved' | 'roundLoading' | 'roundStarted' | 'roundUpdate' | 'roundFinished' | 'worker:start' | 'worker:stop';
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
    },
  }
};
