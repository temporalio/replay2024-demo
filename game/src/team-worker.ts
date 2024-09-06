import fs from 'fs/promises';
import { Worker, InjectedSinks, NativeConnection } from '@temporalio/worker';
import { Env, getEnv, requiredEnv } from './interfaces/env';
import * as activities from './activities';
import { io } from 'socket.io-client';
import { SocketSinks } from './workflow-interceptors';

const socket = io('http://localhost:5173/workers');

/**
 * Run a Worker with an mTLS connection, configuration is provided via environment variables.
 * Note that serverNameOverride and serverRootCACertificate are optional.
 */
async function run({
  address,
  namespace,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath,
  taskQueue,
}: Env) {
  let serverRootCACertificate: Buffer | undefined = undefined;
  if (serverRootCACertificatePath) {
    serverRootCACertificate = await fs.readFile(serverRootCACertificatePath);
  }

  let connection: NativeConnection;

  if (clientCertPath && clientKeyPath) {
    // mTLS configuration
    const serverRootCACertificate = serverRootCACertificatePath
      ? await fs.readFile(serverRootCACertificatePath)
      : undefined;

    connection = await NativeConnection.connect({
      address,
      tls: {
        serverNameOverride,
        serverRootCACertificate,
        clientCertPair: {
          crt: await fs.readFile(clientCertPath),
          key: await fs.readFile(clientKeyPath),
        },
      },
    });
  }
  else {
    console.log(`Using unencrypted connection`);
    connection = await NativeConnection.connect({ address: address });
  }

  const sinks: InjectedSinks<SocketSinks> = {
    emitter: {
      workflowExecute: {
        fn(workflowInfo) {
          try {
            socket.emit('workflow:execute', { identity: worker.options.identity, workflowInfo });
          } catch (err) {
            console.log('emit failed', err);
          }
        },
        callDuringReplay: true, // The default
      },
      workflowComplete: {
        fn(workflowInfo) {
          try {
            socket.emit('workflow:complete', { identity: worker.options.identity, workflowInfo });
          } catch (err) {
            console.log('emit failed', err);
          }
        },
        callDuringReplay: false, // The default
      },
    },
  };

  const worker = await Worker.create({
    connection,
    namespace,
    workflowsPath: require.resolve('./workflows'),
    interceptors: {
      workflowModules: [require.resolve('./workflow-interceptors')],
    },
    taskQueue,
    activities: activities,
    identity: requiredEnv('TEMPORAL_WORKER_IDENTITY'),
    sinks,
    // maxCachedWorkflows: 0,
    maxConcurrentActivityTaskPolls: 4,
    maxConcurrentActivityTaskExecutions: 4,
    stickyQueueScheduleToStartTimeout: '1s',
  });
  console.log('Worker connection successfully established');

  await worker.run();
  await connection.close();
}

run(getEnv()).then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);

// Setup
// Update that triggers activity with 200ms delay
//     maxCachedWorkflows: 0, -- no sticky wf cache
//     maxConcurrentActivityTaskExecutions: 1 -- no parallel activity execution per worker
// Test 1
// 4 workers, uninterrupted
// Test 2
// 4 workers, 2 killed along the way (try to slow down the workflow) 

//