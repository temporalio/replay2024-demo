import fs from 'fs/promises';
import { Worker, NativeConnection } from '@temporalio/worker';
import { Env, getEnv, requiredEnv } from './interfaces/env';
import { buildWorkerActivities } from './activities';

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

  const team = requiredEnv('TEAM');
  const identity = requiredEnv('IDENTITY');
  const worker = await Worker.create({
    connection,
    namespace,
    workflowsPath: require.resolve('./workflows'),
    identity,
    taskQueue: `${team}-team`,
    activities: buildWorkerActivities(namespace, connection, team),
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