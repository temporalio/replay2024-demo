import { io } from 'socket.io-client';
import { Worker, NativeConnection } from '@temporalio/worker';
import { heartbeat, cancelled } from '@temporalio/activity';
import { Client, WorkflowNotFoundError } from '@temporalio/client';
import { log } from '@temporalio/activity';
import { temporal } from '@temporalio/proto';
import { workerStartedSignal } from './workflows';
import { google } from '@temporalio/proto';

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
        stickyQueueScheduleToStartTimeout: '1 second',
        shutdownGraceTime: 500,
      })

      const round = client.workflow.getHandle(roundId);

      try {
        await round.signal(workerStartedSignal, { identity }),
        await worker.runUntil(cancelled())
      } catch (err) {
        if (err instanceof WorkflowNotFoundError) {
          log.info('Round not found, exiting');
          return;
        }
        throw(err);
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

  function timestampToDate(timestamp: google.protobuf.ITimestamp): Date {
    return new Date(timestamp.seconds!.multiply(1000).toNumber() + timestamp.nanos! / 1000000);
  }

  return {
    snakeTracker: async function(snakeId: string) {
      const heartbeater = setInterval(heartbeat, 200);
      let poll = true;
      cancelled().catch(() => poll = false);

      type NextPageToken = Uint8Array | null;

      let nextPageToken: NextPageToken = null;
      let lastRunId: string | null = null;
      let taskScheduledTime: Date | null = null;
      let taskQueueKind: temporal.api.enums.v1.TaskQueueKind | null | undefined = null;

      while (poll) {
        // Cannot get withAbortSignal to work
        // (node:20824) MaxListenersExceededWarning: Possible EventTarget memory leak detected. 11 abort listeners added to [AbortSignal]. MaxListeners is 10. Use events.setMaxListeners() to increase limit
        // FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
        const history = await client.workflowService.getWorkflowExecutionHistory({
          namespace,
          execution: { workflowId: snakeId, runId: lastRunId },
          waitNewEvent: true,
          nextPageToken
        });
        if (!poll) { break }

        nextPageToken = history.nextPageToken as NextPageToken; // Can't understand why this cast is necessary
        if (nextPageToken == null || nextPageToken.length === 0) {
          lastRunId = null;
          continue;
        }

        const events = history.history?.events || [];
        for (const event of events) {
          switch (event.eventType) {
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_EXECUTION_STARTED:
              lastRunId = event.workflowExecutionStartedEventAttributes!.originalExecutionRunId as string;
              break;
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_TASK_STARTED:
              const identity = event.workflowTaskStartedEventAttributes!.identity;
              if (identity) {
                socket.emit('worker:execution', { identity, snakeId });
              }
              break;
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_TASK_SCHEDULED:
              taskScheduledTime = timestampToDate(event.eventTime!);
              taskQueueKind = event.workflowTaskScheduledEventAttributes!.taskQueue?.kind;
              break;
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_TASK_STARTED:
              break;
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_TASK_COMPLETED:
              taskQueueKind = null;
              taskScheduledTime = null;
              break;
            case temporal.api.enums.v1.EventType.EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT:
              let type = '';
              switch (event.workflowTaskTimedOutEventAttributes!.timeoutType) {
                case temporal.api.enums.v1.TimeoutType.TIMEOUT_TYPE_START_TO_CLOSE:
                  type = 'startToClose';
                  break;
                case temporal.api.enums.v1.TimeoutType.TIMEOUT_TYPE_SCHEDULE_TO_START:
                  type = 'scheduleToStart';
                  break;
                case temporal.api.enums.v1.TimeoutType.TIMEOUT_TYPE_SCHEDULE_TO_CLOSE:
                  type = 'scheduleToClose';
                  break;
                case temporal.api.enums.v1.TimeoutType.TIMEOUT_TYPE_HEARTBEAT:
                  type = 'heartbeat';
                  break;
              }
              const timedoutAt = timestampToDate(event.eventTime!);
              const latency = taskScheduledTime ? timedoutAt.getTime() - taskScheduledTime.getTime() : undefined;
              const kind = taskQueueKind == temporal.api.enums.v1.TaskQueueKind.TASK_QUEUE_KIND_STICKY ? 'sticky' : 'normal';
              taskQueueKind = null;
              taskScheduledTime = null;
              socket.emit('worker:timeout', { snakeId, type, kind, latency, runId: lastRunId });
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
    },
  }
};
