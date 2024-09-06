import {
    WorkflowExecuteInput,
    Next,
    WorkflowInboundCallsInterceptor,
    workflowInfo,
    Sinks,
    proxySinks,
} from '@temporalio/workflow';

export interface SocketSinks extends Sinks {
    emitter: {
        workflowExecute(): void;
        workflowComplete(): void;
    };
}

const { emitter } = proxySinks<SocketSinks>();

class WorkflowTaskInterceptor
    implements WorkflowInboundCallsInterceptor {
    constructor(public readonly workflowType: string) { }

    async execute(
        input: WorkflowExecuteInput,
        next: Next<WorkflowInboundCallsInterceptor, 'execute'>,
    ): Promise<unknown> {
        emitter.workflowExecute();
        const result = await next(input);
        emitter.workflowComplete();
        return result;
    }
}

export const interceptors = () => ({
    outbound: [],
    inbound: [new WorkflowTaskInterceptor(workflowInfo().workflowType)],
});