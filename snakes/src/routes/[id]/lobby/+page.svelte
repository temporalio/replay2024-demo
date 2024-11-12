<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { io }	from 'socket.io-client';
	import QR from '@svelte-put/qr/svg/QR.svelte';
	import type { Lobby } from '$lib/snake/types';
	import { onMount } from 'svelte';
	import { GAME_CONFIG } from '$lib/snake/constants';

	$: ({ id: workflowId } = $page.params);

	const lobbySocket = io("/lobby");

	let players: Record<string, number> = {};
	let baseURL = '';

	const startRound = () => {
		goto(`/${workflowId}/round`);
	}

	lobbySocket.on('lobby', ({ lobby }: { lobby: Lobby }) => {
		for (const team of GAME_CONFIG.teamNames) {
			players[team] = lobby.teams[team]?.players || 0;
		}
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
		<div class="flex justify-center items-center flex-col">
			<h1 class="retro">Lobby</h1>
		</div>
	</div>
	<div class="flex flex-col md:flex-row gap-16 justify-center px-8">
		{#each GAME_CONFIG.teamNames as team}
			<div class="border-4 rounded-xl p-4 text-white flex-1"
				class:border-red-500={team === 'red'}
				class:border-blue-500={team === 'blue'}
				class:border-orange-500={team === 'orange'}
				>
				<QR
					data="{baseURL}/team/{team}"
					moduleFill="{team}"
					anchorOuterFill="{team}"
					anchorInnerFill="{team}"
					width="100%"
				/>
				<div class="text-center">
					<a 
						class="text-2xl font-bold"
						class:text-red-600={team === 'red'}
						class:text-blue-600={team === 'blue'}
						class:text-orange-600={team === 'orange'}
						href="{baseURL}/team/{team}">{team.toUpperCase()} TEAM</a>
					<div class="text-xl" id="{team}-players">
						Players: {players[team]}
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="flex flex-col md:flex-row gap-16 justify-center px-8">
		<div class="flex justify-center items-center flex-col gap-4 py-8">
			<button class="retro" on:click={startRound}>Start Round</button>
		</div>
	</div>
</section>
