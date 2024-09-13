import { Worker } from '@temporalio/worker';
import { createNativeConnection, createConnection, WorkerEnv, getEnv, requiredEnv } from './temporal';
import { buildWorkerActivities } from './activities';
import { Client } from '@temporalio/client';

const workflowBundleOptions = () =>
  process.env.NODE_ENV === 'production'
    ? {
        workflowBundle: {
          codePath: require.resolve('../workflow-bundle.js'),
        },
      }
    : { workflowsPath: require.resolve('./workflows') };

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
}: WorkerEnv) {
  const connection = await createNativeConnection({ address, clientCertPath, clientKeyPath, serverNameOverride, serverRootCACertificatePath });
  const client = new Client({
    namespace,
    connection: await createConnection({ address, clientCertPath, clientKeyPath, serverNameOverride, serverRootCACertificatePath })
  });

  const worker = await Worker.create({
    connection,
    namespace,
    ...workflowBundleOptions(),
    taskQueue,
    activities: buildWorkerActivities(namespace, client, connection, requiredEnv('SOCKETIO_HOST')),
    maxConcurrentActivityTaskExecutions: 2,
    debugMode: true,
  });

  await worker.run();
  await connection.close();
}

run(getEnv() as WorkerEnv).then(
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