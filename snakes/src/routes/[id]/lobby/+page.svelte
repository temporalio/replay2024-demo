<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { io }	from 'socket.io-client';
	import { demoPlayersJoin } from '$lib/utilities/game-controls';
	import type { Lobby } from '$lib/snake/types';

	$: ({ id: workflowId } = $page.params);

	const socket = io();
	let redPlayers = 0;
	let bluePlayers = 0;
	let redScore = 0;
	let blueScore = 0;

	const registerDemoPlayers = async () => {
		await demoPlayersJoin(socket);
	}

	const startRound = () => {
		goto(`/${workflowId}/round`);
	}

	socket.on('lobby', ({ lobby }: { lobby: Lobby }) => {
		redPlayers = lobby.teams.red?.players;
		redScore = lobby.teams.red?.score;
		bluePlayers = lobby.teams.blue?.players;
		blueScore = lobby.teams.blue?.score;
	});

	socket.emit('fetchLobby');
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
				<div class="player-count" id="red-players">
					Players: {redPlayers}
				</div>
				<div class="score" id="red-score">
					Score: {redScore}
				</div>
			</div>
			<div class="border-blue-500 border-4 rounded-xl p-24 text-white">
				Blue Team QR
				<div class="player-count" id="blue-players">
					Players: {bluePlayers}
				</div>
				<div class="score" id="blue-score">
					Score: {blueScore}
				</div>
			</div>
		</div>
		<button on:click={registerDemoPlayers}>Register Demo Players</button>
		<button on:click={startRound}>Start Round</button>	
	</div>
</section>
