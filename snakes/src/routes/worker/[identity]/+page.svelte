<script lang="ts">
	import { io, Socket } from 'socket.io-client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let online = false;

	let socket: Socket;
	type WorkerState = 'running' | 'stopped';
	type Worker = {
		identity: string;
		state: WorkerState;
		workflows: Set<string>;
	};
	let worker: Worker;

	onMount(() => {
		socket = io();

		worker = {
			identity: $page.params.identity,
			state: 'stopped',
			workflows: new Set()
		};

		socket.on('connect', () => {
			online = true;
		});
		socket.on('disconnect', () => {
			online = false;
		});

		socket.on('worker:start', ({ identity }) => {
			if (identity != worker.identity) {
				return;
			}
			worker.state = 'running';
		});

		socket.on('worker:execution', ({ identity, snakeId }) => {
			if (identity != worker.identity) {
				return;
			}
			worker.state = 'running';
			worker.workflows.add(snakeId);
		});

		socket.on('worker:timeout', ({ snakeId }) => {
			worker.workflows.delete(snakeId);
		});

		socket.on('worker:stop', ({ identity }) => {
			if (identity != worker.identity) {
				return;
			}
			worker.state = 'stopped';
			worker.workflows.clear();
		});
	});
</script>

<section
	class="flex flex-col items-center {online && worker.state == 'running' ? 'online' : 'offline'}"
>
	{#if online && worker.state == 'running'}
		<div class="mx-auto worker">
			{worker.workflows.size > 0 ? '🐍'.repeat(worker.workflows.size) : '😴'}
		</div>
	{:else}
		<div class="mx-auto worker">☠️</div>
	{/if}
</section>

<style lang="postcss">
	section {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.worker {
		font-size: 8rem;
	}

	.online {
		background-color: green;
	}

	.offline {
		background-color: red;
	}
</style>
