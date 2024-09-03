<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import type { Round } from '$lib/snake/types';
	import SnakeBoard from '$lib/snake/SnakeBoard';
	import SnakeBody from '$lib/snake/SnakeBody';
	import { demoPlayersJoin } from '$lib/utilities/game-controls';

	export let isDemo = false;

	let socket: Socket;

	let board: SnakeBoard;
	let boardCanvas: HTMLCanvasElement;
	let Snakes: Record<string, SnakeBody> = {};
	let snakeCanvases: Record<string, HTMLCanvasElement> = {};

	let roundOver = false;
	let redScore = 0;
	let blueScore = 0;
	let timeLeft = 0;

	let timerInterval: NodeJS.Timeout | undefined;
	let demoInterval: NodeJS.Timeout | undefined;

	const loadRound = (round: Round) => {
		roundOver = false;

		board = new SnakeBoard(boardCanvas, round);
		for (const snake of Object.values(round.snakes)) {
			Snakes[snake.id] = new SnakeBody(snakeCanvases[snake.id], round, snake);
		}

		timeLeft = round.duration;
		if (round.startedAt) {
			timeLeft -= Math.floor((Date.now() - round.startedAt) / 1000);
		}
		timerInterval = setInterval(updateTimer, 1000);

		if (isDemo) {
			demoInterval = setInterval(moveRandomSnake, 50);
		}
	}

	const updateRound = (round: Round) => {
		redScore = round.teams['red'].score || 0;
		blueScore = round.teams['blue'].score || 0;

		board.update(round);
	}

	const finishRound = (_round: Round) => {
		roundOver = true;

		clearInterval(timerInterval);
		timerInterval = undefined;
		clearInterval(demoInterval);
		demoInterval = undefined;

		if (isDemo) {
			socket.emit('roundStart', { duration: 60 });
		}
	}

	const updateTimer = () => {
		timeLeft -= 1;
	}

	onMount(async () => {
		socket = io();
		socket.on('connect_error', (error) => {
			if (socket.active) {
				console.error('Socket.io connection error (will retry):', error);
				setTimeout(socket.connect, 1000);
			}
		});

		socket.on('roundStarted', ({ round }: { round: Round }) => {
			loadRound(round);
		});

		socket.on('roundUpdate', ({ round }: { round: Round }) => {
			updateRound(round);
		});

		socket.on('roundFinished', ({ round }: { round: Round }) => {
			finishRound(round);
		});

		socket.on('roundNotFound', () => {
			socket.emit('roundStart', { duration: 60 });
		});

		socket.on('snakeMoved', ({ snakeId, segments }) => {
			Snakes[snakeId]?.redraw(segments);
		});

		if (isDemo) {
			await demoPlayersJoin(socket);
		}

		socket.emit('fetchRound');

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
		clearInterval(timerInterval);
		timerInterval = undefined;
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
	<canvas bind:this={boardCanvas}/>
	<!-- TODO: Make this dynamic based on player count -->
	<canvas bind:this={snakeCanvases['red-0']}/>
	<canvas bind:this={snakeCanvases['red-1']}/>
	<canvas bind:this={snakeCanvases['blue-0']}/>
	<canvas bind:this={snakeCanvases['blue-1']}/>
</div>
<div id="score">
	<div class="retro" id="time">{timeLeft}</div>
	<div class="retro" id="blue">{blueScore}</div>
	<div class="retro" id="red">{redScore}</div>
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
		@apply absolute top-0 right-0 w-[5vw] flex flex-col gap-0 text-3xl text-center text-white overflow-hidden;
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