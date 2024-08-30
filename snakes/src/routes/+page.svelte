<script lang="ts">
	import { goto } from '$app/navigation';
	import { startGame, startDemoGame } from '$lib/utilities/game-controls';
	import { io } from 'socket.io-client';

	const socket = io();

	let loading = false;
	const beginGame = async () => {
		loading = true
		try {
			const workflowId = await startGame();
			if (!workflowId) {
				alert('Failed to start game');
				return;
			}
			goto(`/${workflowId}/lobby`);
		} catch (e) {
			alert('Failed to start game');
		} finally {
			loading = false;
		}
	};

	const beginDemoGame = async () => {
		loading = true
		try {
			await startDemoGame(socket);
			goto(`/SnakeGame/demo`);
		} catch {
			alert('Failed to start demo game');
		} finally {
			loading = false;
		}
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
	{:else}
	<div class="flex flex-col gap-4">
		<button on:click={beginGame}>Start New Game</button>
		<button on:click={beginDemoGame}>Start Demo Game</button>
	</div>
	{/if}
</section>
