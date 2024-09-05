// Helpers for configuring the mTLS client and worker samples
export function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new ReferenceError(`${name} environment variable is not defined`);
    }
    return value;
}

export interface Env {
    address: string;
    namespace: string;
    clientCertPath?: string;
    clientKeyPath?: string;
    serverNameOverride?: string; // not needed if connecting to Temporal Cloud
    serverRootCACertificatePath?: string; // not needed if connecting to Temporal Cloud
    taskQueue: string;
}

export function getEnv(): Env {
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