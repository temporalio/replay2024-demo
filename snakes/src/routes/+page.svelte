<script lang="ts">
	import { goto } from '$app/navigation';
	import { io } from 'socket.io-client';
	import { GAME_CONFIG } from '$lib/snake/constants';

	let loading = false;
	let resetting = false;

	const beginGame = async ({ demo, practise }: { demo: Boolean, practise: Boolean }) => {
		const socket = io();

		const config = { ...GAME_CONFIG };
		if (practise) {
			config.killWorkers = false;
			config.roundDuration = 30;
		}

		loading = true;
		const finish = await socket.emitWithAck('gameFinish');
		if (finish.error) {
			alert('Failed to stop game');
			console.log('gameStop error', finish.error);
			loading = false;
			return;
		}
		const start = await socket.emitWithAck('gameStart', { config });
		if (start.error) {
			alert('Failed to start game');
			console.log('gameStart error', start.error);
			loading = false;
			return;
		}
		const workflowId = start.workflowId;
		if (demo) {
			goto(`/${workflowId}/demo`);
		} else {
			goto(`/${workflowId}/lobby`);
		}
	};

	const reset = async () => {
		const socket = io();

		resetting = true
		await socket.emitWithAck('reset');
		resetting = false
	};
</script>

<svelte:head>
	<title>Temporal Snakes</title>
	<meta name="description" content="Snakes" />
</svelte:head>

<section >
	<h1 class="retro">Snakes</h1>
	{#if loading}
		<h2 class="retro">Loading Game...</h2>
	{:else if resetting}
		<h2 class="retro">Resetting Game...</h2>
	{:else}
	<div class="flex flex-col gap-4">
		<button class="retro" on:click={() => { beginGame({ demo: false, practise: false })} }>Start New Game</button>
		<button class="retro" on:click={() => { beginGame({ demo: false, practise: true })} }>Start Practice Game</button>
		<button class="retro" on:click={() => { beginGame({ demo: true, practise: false })} }>Start Demo Game</button>
		<button class="retro" on:click={() => { reset() } }>Reset</button>
	</div>
	{/if}
</section>
