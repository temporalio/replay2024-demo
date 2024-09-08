<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import type { Round, Snake } from '$lib/snake/types';
	import SnakeBoard from '$lib/snake/SnakeBoard';
	import SnakeBody from '$lib/snake/SnakeBody';

	export let isDemo = false;

	let socket: Socket;
	let lobbySocket: Socket;

	let board: SnakeBoard;
	let boardCanvas: HTMLCanvasElement;
	let appleCanvas: HTMLCanvasElement;
	let Snakes: Record<string, SnakeBody> = {};
	let snakeCanvases: Record<string, HTMLCanvasElement> = {};

	let waitingForPlayers = false;
	let roundOver = false;
	let redScore = 0;
	let blueScore = 0;
	let timeLeft = 0;

	let timerInterval: NodeJS.Timeout | undefined;
	let demoInterval: NodeJS.Timeout | undefined;

	const loadRound = (round: Round) => {
		roundOver = false;

		board = new SnakeBoard(boardCanvas, appleCanvas, round);
		for (const snake of Object.values(round.snakes)) {
			Snakes[snake.id] = new SnakeBody(snakeCanvases[snake.id], round, snake);
		}

		timeLeft = round.duration;
		if (round.startedAt) {
			timeLeft -= Math.floor((Date.now() - round.startedAt) / 1000);
		}
		timerInterval = setInterval(updateTimer, 1000);

		if (isDemo) {
			demoInterval = setInterval(moveRandomSnake, 100);
		}
	};

	const updateRound = (round: Round) => {
		redScore = round.teams['red'].score || 0;
		blueScore = round.teams['blue'].score || 0;

		board.update(round);
	};

	const finishRound = (_round: Round) => {
		roundOver = true;

		clearInterval(timerInterval);
		timerInterval = undefined;
		clearInterval(demoInterval);
		demoInterval = undefined;
	};

	const startRound = async () => {
		waitingForPlayers = true;
		const players = await lobbySocket.emitWithAck('findPlayers', {
			teams: ['red', 'blue'],
			playersPerTeam: 2
		});
		waitingForPlayers = false;

		const snakes: Snake[] = Object.keys(players).flatMap((team: string) => {
			return players[team].map((playerId: string, index: number) => ({
				id: `${team}-${index}`,
				playerId: playerId,
				teamName: team,
				segments: []
			}));
		});

		socket.emit('roundStart', { duration: 60, snakes });
	};

	const startDemoRound = () => {
		const snakes: Snake[] = [
			{ id: 'red-0', playerId: 'Alex', teamName: 'red', segments: [] },
			{ id: 'red-1', playerId: 'Rob', teamName: 'red', segments: [] },
			{ id: 'blue-0', playerId: 'Candance', teamName: 'blue', segments: [] },
			{ id: 'blue-1', playerId: 'Steve', teamName: 'blue', segments: [] }
		];
		socket.emit('roundStart', { duration: 60, snakes });
	};

	const updateTimer = () => {
		timeLeft -= 1;
	};

	onMount(async () => {
		socket = io();
		lobbySocket = io('/lobby');

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
			if (isDemo) {
				startDemoRound();
			}
		});

		socket.on('roundNotFound', async () => {
			if (isDemo) {
				startDemoRound();
			} else {
				await startRound();
			}
		});

		socket.on('snakeMoved', ({ snakeId, segments }) => {
			Snakes[snakeId]?.redraw(segments);
		});

		socket.emit('fetchRound');
	});

	const moveTowardApple = (snake: Snake) => {
		const head = snake.segments[0]; // Assuming the first element is the snake's head

		// Find the nearest apple
		let nearestApple = board.apples[0];
		let minDistance = Infinity;

		board.apples.forEach((apple) => {
			const deltaX = apple.x - head.head.x;
			const deltaY = apple.y - head.head.y;
			const distance = Math.abs(deltaX) + Math.abs(deltaY); // Manhattan distance
			if (distance < minDistance) {
				minDistance = distance;
				nearestApple = apple;
			}
		});

		const deltaX = nearestApple.x - head.head.x;
		const deltaY = nearestApple.y - head.head.y;

		let preferredDirections = [];

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			if (deltaX > 0) {
				preferredDirections.push('right');
			} else if (deltaX < 0) {
				preferredDirections.push('left');
			}
		} else {
			if (deltaY > 0) {
				preferredDirections.push('down');
			} else if (deltaY < 0) {
				preferredDirections.push('up');
			}
		}

		if (deltaY !== 0) {
			preferredDirections.push(deltaY > 0 ? 'down' : 'up');
		}
		if (deltaX !== 0) {
			preferredDirections.push(deltaX > 0 ? 'right' : 'left');
		}

		const direction = preferredDirections[Math.floor(Math.random() * preferredDirections.length)];
		return direction;
	};

	const moveRandomSnake = () => {
		const snakes = Object.values(Snakes);
		const snake = snakes[Math.floor(Math.random() * snakes.length)];
		const direction = moveTowardApple(snake.snake);
		socket.emit('snakeChangeDirection', { id: snake.id, direction });
	};

	onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}
		clearInterval(demoInterval);
		demoInterval = undefined;
		clearInterval(timerInterval);
		timerInterval = undefined;
	});
</script>

<div class="flex flex-col items-center justify-center z-20">
	{#if isDemo}
		<h2 class="retro">Demo</h2>
	{:else if waitingForPlayers}
		<h2 class="retro">Waiting for players...</h2>
	{:else if roundOver}
		<h2 class="retro">Round Over</h2>
		<p class="retro"><a class="text-white" href={`/SnakeGame/lobby`}>&larr; Back to Lobby</a></p>
	{/if}
</div>
<div id="game">
	<canvas id="board" bind:this={boardCanvas} />
	<canvas bind:this={appleCanvas} />
	<!-- TODO: Make this dynamic based on player count -->
	<canvas bind:this={snakeCanvases['red-0']} />
	<canvas bind:this={snakeCanvases['red-1']} />
	<canvas bind:this={snakeCanvases['blue-0']} />
	<canvas bind:this={snakeCanvases['blue-1']} />
</div>
<div id="score">
	<div class="retro" id="time">{timeLeft}</div>
	<div class="retro" id="blue">{blueScore}</div>
	<div class="retro" id="red">{redScore}</div>
</div>

<style lang="postcss">
	#game {
		position: absolute;
		top: 0;
		left: 0;
		width: 95vw;
		height: 100vh;
	}
	#game canvas {
		position: absolute;
		top: 14px;
		left: 14px;
		width: calc(95vw - 28px);
		height: calc(100vh - 28px);
		overflow: hidden;
	}
	#board {
		border: 1px solid #59fda0;
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
