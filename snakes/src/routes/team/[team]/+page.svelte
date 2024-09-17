<script lang="ts">
	import { page } from '$app/stores';
	import { io } from 'socket.io-client';
	import type { Lobby, Snake, Direction } from '$lib/snake/types';
	import playerId from '$lib/stores/playerId';

	const { team } = $page.params;

	// Allow overriding playerId in the URL for testing
	const pID = $page.url.searchParams.get('playerId') || $playerId;

	const lobbySocket = io(`/lobby`, {
		auth: { id: pID, team: team }
	});
	const gameSocket = io();

	let invite: ((id: string) => void) | undefined;
	let accepted = false;
	let playing = false;
	let snake: Snake | undefined;

	lobbySocket.on('roundInvite', (cb) => {
		snake = undefined;
		setupInvite(cb);
	});

	lobbySocket.on('roundReady', () => {
		resetInvite();
	});

	lobbySocket.on('roundPlaying', ({ snake: playerSnake }: { snake: Snake }) => {
		snake = playerSnake;
		playing = true;
	});

	lobbySocket.on('roundFinished', () => {
		playing = false;
	});

	const setupInvite = (cb: (id: string) => void) => {
		invite = cb;
		accepted = false;
	};

	const resetInvite = () => {
		invite = undefined;
		accepted = false;
	};

	const acceptInvite = () => {
		if (invite) {
			invite(pID);
			invite = undefined;
			accepted = true;
		}
	};

	const onMove = (direction: Direction) => {
		console.log('move', direction);
		if (snake) {
			gameSocket.emit('snakeChangeDirection', { id: snake.id, direction });
		}
		return false;
	};
</script>

<svelte:head>
	<title>{team.toUpperCase()} Lobby</title>
</svelte:head>

{#if snake && playing}
	<div class="flex flex-col items-center gap-4 grow pt-4">
		<div class="absolute top-2 right-2">
			<div
				class="w-10 h-10 rounded border-2 relative"
				class:bg-red-600={team === 'red'}
				class:bg-blue-600={team === 'blue'}
				class:bg-orange-500={team === 'orange'}
			>
				<span class="absolute top-2 left-2 rounded bg-black w-2 h-2" />
				<span class="absolute top-2 right-2 rounded bg-black w-2 h-2" />
			</div>
		</div>
		<button class="mx-auto" on:touchstart={() => onMove('up')}>&#8593;</button>
		<div class="flex gap-4">
			<button on:touchstart={() => onMove('left')}>&#8592;</button>
			<button on:touchstart={() => onMove('right')}>&#8594;</button>
		</div>
		<button class="mx-auto" on:touchstart={() => onMove('down')}>&#8595;</button>
	</div>

	<style lang="postcss">
		button {
			@apply flex items-center justify-center border-4 border-white h-24 w-24 text-3xl;
		}

		button:active,
		button:focus,
		button:hover {
			@apply bg-gray-800;
		}
	</style>
{:else}
	<section>
		<div class="border-4 rounded-xl p-4 text-white text-center"
			class:border-red-600={team === 'red'}
			class:border-blue-600={team === 'blue'}
			class:border-orange-500={team === 'orange'}
		>
			<h1 class="retro">{team.toUpperCase()} Lobby</h1>
		</div>
		<div class="justify-center p-4 text-center">
			{#if invite}
				<div>
					<button class="retro" on:click={acceptInvite}>Start Game</button>
				</div>
			{:else if accepted}
				<div class="retro" style="font-size: 1em">
					<p>Please wait for other players...</p>
				</div>
			{:else}
				<div class="retro" style="font-size: 1em">
					<p>Waiting for game to start...</p>
				</div>
			{/if}
		</div>
	</section>
{/if}
