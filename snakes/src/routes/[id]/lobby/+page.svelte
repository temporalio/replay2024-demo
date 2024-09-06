<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { io }	from 'socket.io-client';
	import QR from '@svelte-put/qr/svg/QR.svelte';
	import type { Lobby } from '$lib/snake/types';
	import { onMount } from 'svelte';

	$: ({ id: workflowId } = $page.params);

	const lobbySocket = io("/lobby");

	let redPlayers = 0;
	let bluePlayers = 0;
	let redScore = 0;
	let blueScore = 0;
	let baseURL = '';

	const startRound = () => {
		goto(`/${workflowId}/round`);
	}

	lobbySocket.on('lobby', ({ lobby }: { lobby: Lobby }) => {
		redPlayers = lobby.teams.red?.players || 0;
		redScore = lobby.teams.red?.score || 0;
		bluePlayers = lobby.teams.blue?.players || 0;
		blueScore = lobby.teams.blue?.score || 0;
	});

	onMount(() => {
		baseURL = window.location.origin;
	});
</script>

<svelte:head>
	<title>Lobby</title>
	<meta name="description" content="Temporal Snakes" />
</svelte:head>

<section class="w-screen">
	<div class="flex flex-col md:flex-row gap-16 justify-center px-8">
		<div class="border-red-500 border-4 rounded-xl p-4 text-white">
			<QR
				data="{baseURL}/{workflowId}/team/red"
				moduleFill="red"
				anchorOuterFill="red"
				anchorInnerFill="red"
				width="100%"
			/>
			<div class="text-center">
				<a class="text-red-600 text-2xl font-bold" href="{baseURL}/{workflowId}/team/red">RED TEAM</a>
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
			<button class="retro" on:click={startRound}>Start Round</button>		
		</div>	
		<div class="border-blue-500 border-4 rounded-xl p-4 text-white">
			<QR
				data="{baseURL}/{workflowId}/team/blue"
				moduleFill="blue"
				anchorOuterFill="blue"
				anchorInnerFill="blue"
				width="100%"
			/>
			<div class="text-center">
				<a class="text-blue-600 text-2xl font-bold" href="{baseURL}/{workflowId}/team/blue">BLUE TEAM</a>
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
