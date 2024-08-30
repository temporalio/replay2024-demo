<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { CELL_SIZE } from '$lib/snake/constants';
	import { io, Socket } from 'socket.io-client';
	import type { Round } from '$lib/snake/types';
	import SnakeBody from '$lib/snake/SnakeBody';
	import SnakeRound from '$lib/snake/SnakeRound';
	import { demoPlayersJoin } from '$lib/utilities/game-controls';

	export let isDemo = false;

	let socket: Socket;

	let Snakes: Record<string, SnakeBody> = {};

	let backgroundCanvas: HTMLCanvasElement;
	let snakeCanvases: Record<string, HTMLCanvasElement> = {};

	let width: number;
	let height: number;
	let roundOver = false;
	let redScore = 0;
	let blueScore = 0;

	let demoInterval: NodeJS.Timeout | undefined;

	onMount(async () => {
		socket = io();

		socket.on('roundStarted', ({ round }: { round: Round }) => {
			width = round.config.width;
			height = round.config.height;
			roundOver = false;

			const snakeRound = new SnakeRound(backgroundCanvas.getContext('2d')!, round, socket);
			for (const snake of Object.values(round.snakes)) {
				Snakes[snake.id] = new SnakeBody(snakeRound, snakeCanvases[snake.id].getContext('2d')!, snake, socket);
			}

			if (isDemo) {
				demoInterval = setInterval(moveRandomSnake, 50);
			}
		});

		socket.on('roundUpdate', ({ round }: { round: Round }) => {
			redScore = round.teams['red'].score || 0;
			blueScore = round.teams['blue'].score || 0;
		});

		socket.on('roundFinished', () => {
			roundOver = true;
			if (isDemo) {
				clearInterval(demoInterval);
				demoInterval = undefined;
				socket.emit('roundStart', { duration: 60 });
			}
		});

		socket.on('snakeMoved', ({ snakeId, segments }) => {
			Snakes[snakeId].redraw(segments);
		});

		socket.on('connect_error', (error) => {
			if (socket.active) {
				console.error('Socket.io connection error (will retry):', error);
				setTimeout(socket.connect, 1000);
			}
		});

		if (isDemo) {
			await demoPlayersJoin(socket);
			socket.emit('roundStart', { duration: 60 });
		}

		// TODO: Remove this when we have player UI
		if (!isDemo) {
			const testSnakeId = 'blue-1';
			const directions = new Map<string, string>([
				['ArrowLeft', 'left'],
				['ArrowUp', 'up'],
				['ArrowRight', 'right'],
				['ArrowDown', 'down']
			]);

			document.addEventListener('keydown', function (event) {
				const direction = directions.get(event.key);
				if (direction) {
					socket.emit('snakeChangeDirection', { id: testSnakeId, direction });
				}
				return false;
			});
		}
	});

	const moveRandomSnake = () => {
		const snakes = Object.values(Snakes);
		const snake = snakes[Math.floor(Math.random() * snakes.length)];
		const direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
		socket.emit('snakeChangeDirection', { id: snake.id, direction });
	}

	onDestroy (() => {
		if (socket) {
			socket.disconnect();
		}
		clearInterval(demoInterval);
		demoInterval = undefined;
	});
</script>

<div class="flex flex-col items-center justify-center">
	{#if isDemo}
		<h2 class="retro">Demo</h2>
	{:else}
		{#if roundOver}
			<h2 class="retro">Round Over</h2>
			<p class="retro"><a class="text-white" href={`/SnakeGame/lobby`}>&larr; Back to Lobby</a></p>
		{/if}
	{/if}
</div>
<div id="game">
	<canvas bind:this={backgroundCanvas} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<!-- TODO: Make this dynamic based on player count -->
	<canvas bind:this={snakeCanvases['red-0']} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvases['red-1']} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvases['blue-0']} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvases['blue-1']} width={width * CELL_SIZE} height={height * CELL_SIZE} />
</div>
<div id="score">
	<div class="retro-lite" id="time" />
	<div class="retro-lite" id="blue">{blueScore}</div>
	<div class="retro-lite" id="red">{redScore}</div>
</div>

<style lang="postcss">
	#game, #game canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 95vw;
		height: 100vh;
		overflow: hidden;
	}

	#score {
		@apply absolute top-0 right-0 w-[5vw] flex flex-col gap-0 text-3xl text-center text-white;
	}

	#time {
		@apply bg-white py-5 text-black;
	}

	#blue {
		@apply bg-[blue] py-5;
	}

	#red {
		@apply bg-[red] py-5;
	}
</style>