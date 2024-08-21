<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	$: ({ id: workflowId, runId } = $page.params);

	const startRound = async () => {
		const response = await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ action: 'startRound', duration: 60, workflowId, runId })
		});
		const result = await response.json();
		debugger;
		goto(`/${workflowId}/round`);
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Snakes</h1>
	<button on:click={startRound}>Start Round</button>
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
