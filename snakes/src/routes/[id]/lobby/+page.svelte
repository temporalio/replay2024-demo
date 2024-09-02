<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { io }	from 'socket.io-client';
	import { demoPlayersJoin } from '$lib/utilities/game-controls';

	$: ({ id: workflowId } = $page.params);

	const registerDemoPlayers = async () => {
		const socket = io();
		await demoPlayersJoin(socket);
		socket.disconnect();
	}

	const startRound = () => {
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
		<button on:click={registerDemoPlayers}>Register Demo Players</button>
		<button on:click={startRound}>Start Round</button>	
	</div>
</section>
