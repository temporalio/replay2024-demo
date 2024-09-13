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
  let workerIds: string[] = [];
  let workers: Record<string, Worker> = {};

  onMount(() => {
    socket = io();

    if ($page.params.name == 'snake-worker-host-worker-1') {
      workerIds = ['snake-worker-1', 'snake-worker-2'];
    } else if ($page.params.name == 'snake-worker-host-worker-2') {
      workerIds = ['snake-worker-3', 'snake-worker-4'];
    } else {
      workerIds = ['snake-worker-5', 'snake-worker-6'];
    }

    for (const id of workerIds) {
      workers[id] = { identity: id, state: 'stopped', workflows: new Set() };
    }

    socket.on('connect', () => {
      online = true;
    });

    socket.on('disconnect', () => {
      online = false;
    });

    socket.on('worker:start', ({ identity }) => {
      const worker = workers[identity];
      if (!worker) {
        return;
      }
      worker.state = 'running';
      workers = workers;
    });

    socket.on('worker:execution', ({ identity, snakeId }) => {
      for (const worker of Object.values(workers)) {
        worker.workflows.delete(snakeId);
      }

      const worker = workers[identity];
      if (!worker) {
        return;
      }
      worker.state = 'running';
      worker.workflows.add(snakeId);
      workers = workers;
    });

    socket.on('worker:timeout', ({ snakeId }) => {
      for (const worker of Object.values(workers)) {
        worker.workflows.delete(snakeId);
      }
      workers = workers;
    });

    socket.on('worker:stop', ({ identity }) => {
      const worker = workers[identity];
      if (!worker) {
        return;
      }
      worker.state = 'stopped';
      worker.workflows.clear();
      workers = workers;
    });
  });
</script>

<section class="flex gap-2">
  {#each workerIds as workerId}
    {@const worker = workers[workerId]}
    <div
      class="worker flex flex-auto items-center justify-center w-32 {online &&
      worker.state == 'running'
        ? 'online'
        : 'offline'}"
    >
      {#if online && worker.state == 'running'}
        {worker.workflows.size > 0 ? '🐍'.repeat(worker.workflows.size) : '😴'}
      {:else}
        ☠️
      {/if}
    </div>
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

  .online {
    background-color: green;
  }

  .offline {
    background-color: red;
  }
</style>
