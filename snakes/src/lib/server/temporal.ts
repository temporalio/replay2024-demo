import fs from 'fs';
import { Connection } from '@temporalio/client';

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

export function getEnv(): ClientEnv {
  return {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    clientCertPath: process.env.TEMPORAL_CLIENT_CERT_PATH,
    clientKeyPath: process.env.TEMPORAL_CLIENT_KEY_PATH,
    serverNameOverride: process.env.TEMPORAL_SERVER_NAME_OVERRIDE,
    serverRootCACertificatePath: process.env.TEMPORAL_SERVER_ROOT_CA_CERT_PATH,
  };
}

export function createConnection({
  address,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath,
}: ConnectionEnv): Connection {
  let serverRootCACertificate: Buffer | undefined = undefined;
  if (serverRootCACertificatePath) {
    serverRootCACertificate = fs.readFileSync(serverRootCACertificatePath);
  }

  if (clientCertPath && clientKeyPath) {
    return Connection.lazy({
      address,
      tls: {
        serverNameOverride,
        serverRootCACertificate,
        clientCertPair: {
          crt: fs.readFileSync(clientCertPath),
          key: fs.readFileSync(clientKeyPath),
        },
      },
    });
  }
  else {
    return Connection.lazy({ address: address });
  }
}
