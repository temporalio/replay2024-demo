import { Worker } from '@temporalio/worker';
import { createNativeConnection, createConnection, WorkerEnv, getEnv } from './temporal';
import { buildWorkerActivities } from './activities';
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
    taskQueue,
    activities: buildWorkerActivities(namespace, client, connection),
    maxConcurrentActivityTaskExecutions: 1,
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
