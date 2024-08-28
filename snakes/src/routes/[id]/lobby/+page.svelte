<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { startTestRound } from '$lib/utilities/game-controls';

	$: ({ id: workflowId, runId } = $page.params);

	const startRound  = async () => {
		await startTestRound(workflowId);
		goto(`/${workflowId}/round`);
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1 class="retro">Lobby</h1>
	<div class="flex flex-col gap-4 justify-center">
		<div class="flex gap-4">
			<div class="border-red-500 border-4 rounded-xl p-24 text-white">
				Red Team QR
			</div>
			<div class="border-blue-500 border-4 rounded-xl p-24 text-white">
				Blue Team QR
			</div>
		</div>
		<button on:click={startRound}>Start Round</button>	
	</div>
</section>
