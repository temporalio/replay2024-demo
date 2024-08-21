<script lang="ts">
	import { goto } from '$app/navigation';

	const input = {
		width: 10,
		height: 10,
		snakesPerTeam: 2,
		teams: [{ name: 'Red' }, { name: 'Blue' }]
	};

	const startGame = async () => {
		const response = await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ action: 'startGame', input })
		});
		const { workflowId } = await response.json();
		goto(`/${workflowId}`);
	};
</script>

<svelte:head>
	<title>Temporal Snakes</title>
	<meta name="description" content="Snakes" />
</svelte:head>

<section>
	<h1>Snakes</h1>
	<button on:click={startGame}>Start Game</button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
