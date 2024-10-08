import { Worker } from '@temporalio/worker';
import { createNativeConnection, createConnection, WorkerEnv, getEnv, requiredEnv } from './temporal';
import { buildGameActivities, buildTrackerActivities } from './activities';
import { Client } from '@temporalio/client';

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
    workflowsPath: require.resolve('./workflows'),
    identity: 'game-worker',
    taskQueue,
    activities: {
      ...buildGameActivities(requiredEnv('SOCKETIO_HOST')),
      ...buildTrackerActivities(namespace, client, requiredEnv('SOCKETIO_HOST'))
    },
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