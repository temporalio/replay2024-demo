<script lang="ts">
	import { goto } from '$app/navigation';
	import { startGame } from '$lib/utilities/game-controls';

	let loading = false;
	const beginGame = async ({ demo }: { demo: Boolean }) => {
		loading = true
		try {
			const workflowId = await startGame();
			if (!workflowId) {
				alert('Failed to start game');
				return;
			}
			if (demo) {
				goto(`/${workflowId}/demo`);
			} else {
				goto(`/${workflowId}/lobby`);
			}
		} catch (e) {
			alert('Failed to start game');
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
		<button class="retro" on:click={() => { beginGame({ demo: false })} }>Start New Game</button>
		<button class="retro" on:click={() => { beginGame({ demo: true })} }>Start Demo Game</button>
	</div>
	{/if}
</section>
