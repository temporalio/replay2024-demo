import fs from 'fs/promises';
import { NativeConnection, NativeConnectionOptions } from '@temporalio/worker';
import { Connection, ConnectionOptions } from '@temporalio/client';

// Helpers for configuring the mTLS client and worker samples
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ReferenceError(`${name} environment variable is not defined`);
  }
  return value;
}

export interface ConnectionEnv {
  address: string;
  clientCertPath?: string;
  clientKeyPath?: string;
  serverNameOverride?: string; // not needed if connecting to Temporal Cloud
  serverRootCACertificatePath?: string; // not needed if connecting to Temporal Cloud
}

export interface ClientEnv extends ConnectionEnv {
  namespace: string;
}

export interface WorkerEnv extends ClientEnv {
  taskQueue: string;
}

export function getEnv(): ClientEnv | WorkerEnv {
  return {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    clientCertPath: process.env.TEMPORAL_CLIENT_CERT_PATH,
    clientKeyPath: process.env.TEMPORAL_CLIENT_KEY_PATH,
    serverNameOverride: process.env.TEMPORAL_SERVER_NAME_OVERRIDE,
    serverRootCACertificatePath: process.env.TEMPORAL_SERVER_ROOT_CA_CERT_PATH,
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'game',
  };
}

export async function connectionOptions({
  address,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath,
}: ConnectionEnv): Promise<NativeConnectionOptions | ConnectionOptions> {
  let serverRootCACertificate: Buffer | undefined = undefined;
  if (serverRootCACertificatePath) {
    serverRootCACertificate = await fs.readFile(serverRootCACertificatePath);
  }

  if (clientCertPath && clientKeyPath) {
    return {
      address,
      tls: {
        serverNameOverride,
        serverRootCACertificate,
        clientCertPair: {
          crt: await fs.readFile(clientCertPath),
          key: await fs.readFile(clientKeyPath),
        },
      },
    };
  }
  else {
    return { address: address };
  }
};

export async function createNativeConnection({
  address,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath,
}: ConnectionEnv): Promise<NativeConnection> {
  const options = await connectionOptions({
    address,
    clientCertPath,
    clientKeyPath,
    serverNameOverride,
    serverRootCACertificatePath,
  }) as NativeConnectionOptions;
  return NativeConnection.connect(options);
};

export async function createConnection({
  address,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath,
}: ConnectionEnv): Promise<Connection> {
  const options = await connectionOptions({
    address,
    clientCertPath,
    clientKeyPath,
    serverNameOverride,
    serverRootCACertificatePath,
  }) as ConnectionOptions;
  return Connection.connect(options);
};