<script lang="ts">
	import { io, Socket } from 'socket.io-client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let online = false;
	let roundInProgress = false;

	let socket: Socket;
	type WorkerState = 'running' | 'stopped';
	type Worker = {
		identity: string;
		state: WorkerState;
		workflows: Set<string>;
		stoppedAt: number;
	};
	let workerIds: string[] = [];
	let workers: Record<string, Worker> = {};

	onMount(() => {
		socket = io();

		let hostId = $page.params.id;

		if (hostId == '1') {
			workerIds = ['snake-worker-1', 'snake-worker-2'];
		} else if (hostId == '2') {
			workerIds = ['snake-worker-3', 'snake-worker-4'];
		} else {
			workerIds = ['snake-worker-5', 'snake-worker-6'];
		}

		for (const id of workerIds) {
			workers[id] = { identity: id, state: 'stopped', workflows: new Set(), stoppedAt: 0 };
		}

		socket.on('connect', () => {
			online = true;
		});

		socket.on('disconnect', () => {
			online = false;
		});

		socket.on('roundStarted', () => {
			roundInProgress = true;
		});

		socket.on('roundFinished', () => {
			roundInProgress = false;
		});

		socket.on('worker:start', ({ identity }) => {
			const worker = workers[identity];
			if (!worker) {
				return;
			}
			worker.state = 'running';
			worker.stoppedAt = 0;
			workers = workers;
		});

		socket.on('task:completed', ({ identity, snakeId, time }) => {
			roundInProgress = true;

			for (const worker of Object.values(workers)) {
				worker.workflows.delete(snakeId);
			}

			const worker = workers[identity];
			if (!worker) {
				return;
			}
			if (time - worker.stoppedAt < 1000) {
				return;
			}
			worker.state = 'running';
			worker.stoppedAt = 0;
			worker.workflows.add(snakeId);
			workers = workers;
		});

		socket.on('task:timeout', ({ snakeId }) => {
			for (const worker of Object.values(workers)) {
				worker.workflows.delete(snakeId);
			}
			workers = workers;
		});

		socket.on('worker:stop', ({ identity, time }) => {
			const worker = workers[identity];
			if (!worker) {
				return;
			}
			worker.state = 'stopped';
			worker.stoppedAt = time;
			worker.workflows.clear();
			workers = workers;
		});
	});
</script>

<section class="flex gap-2">
	{#each workerIds as workerId}
		{@const worker = workers[workerId]}
		{#if !online}
			<div class="worker flex flex-auto w-32 items-center justify-center offline">
				🔌
			</div>
		{:else if !roundInProgress}
			<div class="flex flex-auto w-32 noround" />
		{:else if worker.state == 'running'}
			<div class="worker flex flex-auto w-32 items-center justify-center running">
				{worker.workflows.size > 0 ? '🐍'.repeat(worker.workflows.size) : '😴'}
			</div>
		{:else}
			<div class="worker flex flex-auto w-32 items-center justify-center stopped">
				☠️
			</div>
		{/if}
	{/each}
</section>

<style lang="postcss">
	section {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.worker {
		font-size: 8rem;
	}

	.running {
		background-color: green;
	}

	.stopped {
		background-color: red;
	}

	.noround {
		background-color: #222;
	}

	.offline {
		background-color: red;
	}
</style>
