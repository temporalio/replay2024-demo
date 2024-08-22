<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	$: ({ id: workflowId, runId } = $page.params);

	const names = ['Alex', 'Rob', 'Candace', 'Laura'];

	const playerRegisters = async (name) => {
		const response = await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ action: 'playerRegister', name, workflowId })
		});
		const result = await response.json();
	};

	const playersRegister = async () => {
		for (const name of names) {
			await playerRegisters(name);
		}
	};

	const playerJoins = async (name, team) => {
		const response = await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ action: 'playerJoin', workflowId: `player-${name}`, gameWorkflowId: workflowId, team })
		});
		const result = await response.json();
	};

	const playersJoin = async () => {
		for (const [i, name] of names.entries()) {
			await playerJoins(name, i < 2 ? 'blue' : 'red');
		}
	};

	const startRound = async () => {
		const response = await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ action: 'startRound', duration: 6000, workflowId, runId })
		});
		const { result } = await response.json();
		if (result.outcome.failure) {
			alert(result.outcome.failure.message);
			return;
		}
		goto(`/${workflowId}/round`);
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Snakes</h1>
	<div class="flex flex-col gap-4 justify-center">
		<button on:click={playersRegister}>Players Register</button>
		<button on:click={playersJoin}>Players Join</button>
		<button on:click={startRound}>Start Round</button>	
	</div>
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
