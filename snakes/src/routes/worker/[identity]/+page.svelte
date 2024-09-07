<script lang="ts">
	import { io, Socket } from 'socket.io-client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

    let online = false;

    let workerSocket: Socket;
    let workflows: Record<string, any> = {};

	onMount(() => {
        workerSocket = io("/workers");

        workerSocket.on('connect', () => {
            online = true;
        });

        workerSocket.on('workflow:execute', ({ identity, workflowInfo }) => {
            if (identity === $page.params.identity) {
                workflows[workflowInfo.id] = workflowInfo;
            }
        });

        workerSocket.on('workflow:complete', ({ identity, workflowInfo }) => {
            delete workflows[workflowInfo.id];
        });

        workerSocket.on('disconnect', () => {
            online = false;
        });
	});
</script>

<section>
    <h2 class="retro">Worker: { online ? "Online" : "Offline"}</h2>
    <p class="retro">Workflows:</p>
    <ul class="retro">
        {#each Object.values(workflows) as workflow}
            <li>{workflow.workflowType}[{workflow.workflowId}]</li>
        {/each}
    </ul>
</section>