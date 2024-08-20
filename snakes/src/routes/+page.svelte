<script lang='ts'>

	const startGame = () => {
		const body = JSON.stringify({
			namespace: 'default',
			workflowId: `game-${Date.now()}`,
			workflowType: {
				name: 'GameWorkflow',
			},
			taskQueue: {
				name: 'update-chaos-test',
			},
			input: [{
				width: 1000,
				height: 1000,
				teams: [{ name: 'red' }, { name: 'green' }],
				snakesPerTeam: 2
			}]
		});

		fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body,
		});
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		Snakes
	</h1>
	<button on:click={startGame}>
		Start Game
	</button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

</style>
