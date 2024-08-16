import fs from 'fs/promises';
import { Connection, Client } from '@temporalio/client';
import { Worker, NativeConnection } from '@temporalio/worker';
import { runWorkflows } from './starter';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Env, getEnv } from './interfaces/env';

/**
 * Schedule a Workflow connecting with mTLS if available, or fallback to local server.
 */
async function run({
  address,
  namespace,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath,
  taskQueue,
}: Env, numPlayers?: number) {
  let client: Client;
  let connection: Connection | NativeConnection;

  if (clientCertPath && clientKeyPath) {
    // mTLS configuration
    const serverRootCACertificate = serverRootCACertificatePath
      ? await fs.readFile(serverRootCACertificatePath)
      : undefined;

    connection = await Connection.connect({
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
    connection = await Connection.connect({ address: address });
  }

  client = new Client({ connection, namespace });
  console.log(`Connecting to ${address} and ${namespace}`);
  await runWorkflows(client, taskQueue, numPlayers !== undefined ? numPlayers : 1);

}

const argv = yargs(hideBin(process.argv)).options({
  numPlayers: { type: 'number', alias: 'n' },
}).argv as { numOrders?: number };

run(getEnv(), argv.numOrders).then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
