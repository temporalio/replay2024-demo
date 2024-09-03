<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { io }	from 'socket.io-client';
	import QR from '@svelte-put/qr/svg/QR.svelte';
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
	<title>Lobby</title>
	<meta name="description" content="Temporal Snakes" />
</svelte:head>

<section class="w-screen">
	<div class="flex flex-col md:flex-row gap-16 justify-center px-8">
		<div class="border-red-500 border-4 rounded-xl p-4 text-white">
			<QR
				data="/{workflowId}/red"
				moduleFill="red"
				anchorOuterFill="red"
				anchorInnerFill="red"
				width="100%"
			/>
			<div class="text-center">
				<a class="text-red-600 text-2xl font-bold" href="/{workflowId}/red">RED TEAM</a>
				<div class="text-xl" id="red-players">
					Players: {redPlayers}
				</div>
				<div class="text-xl" id="red-score">
					Score: {redScore}
				</div>
			</div>
		</div>
		<div class="flex justify-center items-center flex-col gap-4">
			<h1 class="retro">Lobby</h1>
			<button class="retro" on:click={registerDemoPlayers}>Register Demo Players</button>
			<button class="retro" on:click={startRound}>Start Round</button>		
		</div>	
		<div class="border-blue-500 border-4 rounded-xl p-4 text-white">
			<QR
				data="/{workflowId}/blue"
				moduleFill="blue"
				anchorOuterFill="blue"
				anchorInnerFill="blue"
				width="100%"
			/>
			<div class="text-center">
			<a class="text-blue-600 text-2xl font-bold" href="/{workflowId}/blue">BLUE TEAM</a>
			<div class="text-xl" id="blue-players">
				Players: {bluePlayers}
			</div>
			<div class="text-xl" id="blue-score">
				Score: {blueScore}
			</div>
			</div>
		</div>
	</div>
</section>
