<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import type { Round, Snake, Direction } from '$lib/snake/types';
	import SnakeBoard from '$lib/snake/SnakeBoard';
	import SnakeBody from '$lib/snake/SnakeBody';
	import { GAME_CONFIG, SNAKE_NUMBERS } from '$lib/snake/constants';

	export let isDemo = false;

	let socket: Socket;
	let lobbySocket: Socket;

	let board: SnakeBoard;
	let boardCanvas: HTMLCanvasElement;
	let appleCanvas: HTMLCanvasElement;
	let Snakes: Record<string, SnakeBody> = {};
	let snakeCanvases: Record<string, HTMLCanvasElement> = {};

	let waitingForPlayers = false;
	let roundLoading = false;
	let roundOver = false;

	let scores: Record<string, number> = {};
	let timeLeft = 0;

	type WorkerState = 'running' | 'stopped' | 'unknown';
	type Worker = {
		identity: string;
		state: WorkerState;
		workflows: Set<string>;
		stoppedAt: number;
	};
	let workerIds: string[] = [];
	let workers: Record<string, Worker> = {};
	let showWorkers = false;

	let timerInterval: NodeJS.Timeout | undefined;
	let demoInterval: NodeJS.Timeout | undefined;

	const loadRound = (round: Round) => {
		roundLoading = true;
		roundOver = false;

		board = new SnakeBoard(boardCanvas, appleCanvas, round);
		for (const snake of Object.values(round.snakes)) {
			Snakes[snake.id] = new SnakeBody(snakeCanvases[snake.id], round, snake);
		}

		workerIds = round.workerIds;
		for (const id of workerIds) {
			workers[id] = { identity: id, state: 'unknown', workflows: new Set(), stoppedAt: 0 };
		}

		if (round.config.killWorkers) {
			showWorkers = true;
		}

		timeLeft = round.duration;
		if (round.startedAt) {
			timeLeft -= Math.floor((Date.now() - round.startedAt) / 1000);
		}
	};

	const startRound = (round: Round) => {
		roundLoading = false;

		board.update(round);

		timerInterval = setInterval(updateTimer, 1000);

		if (isDemo) {
			demoInterval = setInterval(steerRandomSnake, 100);
		}
	};

	const updateRound = (round: Round) => {
		for (const team of GAME_CONFIG.teamNames) {
			scores[team] = round.teams[team].score || 0;
		}

		board.update(round);
	};

	const finishRound = (_round: Round) => {
		roundOver = true;

		clearInterval(timerInterval);
		timerInterval = undefined;
		clearInterval(demoInterval);
		demoInterval = undefined;
	};

	const startNewRound = async () => {
		waitingForPlayers = true;
		const players = await lobbySocket.emitWithAck('findPlayers', {
			teams: GAME_CONFIG.teamNames,
			playersPerTeam: GAME_CONFIG.snakesPerTeam
		});
		waitingForPlayers = false;

		const snakes: Snake[] = Object.keys(players).flatMap((team: string) => {
			return players[team].map((playerId: string, i: number) => ({
				id: `${team}-${i}`,
				playerId: playerId,
				teamName: team,
				segments: []
			}));
		});

		socket.emit('roundStart', { snakes });
	};

	const startNewDemoRound = async () => {
		const snakes: Snake[] = GAME_CONFIG.teamNames.flatMap((team: string) => {
			return SNAKE_NUMBERS.map((i) => {
				return { id: `${team}-${i}`, playerId: `${team} Bot ${i}`, teamName: team, segments: [] };
			});
		});

		socket.emit('roundStart', { snakes });
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

		socket.on('roundLoading', ({ round }: { round: Round }) => {
			roundLoading = true;
			loadRound(round);
		});

		socket.on('roundStarted', ({ round }: { round: Round }) => {
			roundLoading = false;
			startRound(round);
		});

		socket.on('roundUpdate', ({ round }: { round: Round }) => {
			updateRound(round);
		});

		socket.on('roundFinished', ({ round }: { round: Round }) => {
			finishRound(round);
			if (isDemo) {
				startNewDemoRound();
			}
		});

		socket.on('roundNotFound', async () => {
			console.log('Round not found, starting new round');
			if (isDemo) {
				await startNewDemoRound();
			} else {
				await startNewRound();
			}
		});

		socket.on('snakeMoved', ({ snakeId, segments }) => {
			Snakes[snakeId]?.redraw(segments);
		});

		socket.emit('fetchRound');

		socket.on('worker:start', ({ identity }) => {
			console.log('worker:start', { identity });
			const worker = workers[identity];
			if (!worker) {
				return;
			}
			worker.state = 'running';
      worker.stoppedAt = 0;
			workers = workers;
		});

		socket.on('task:completed', ({ identity, snakeId, time }) => {
			console.log('task:completed', { identity, snakeId, time });
			for (const worker of Object.values(workers)) {
				worker.workflows.delete(snakeId);
			}
			const worker = workers[identity];
			if (!worker) {
				return;
			}
      if (time - worker.stoppedAt < 500) {
        return;
      }
			worker.state = 'running';
      worker.stoppedAt = 0;
			worker.workflows.add(snakeId);
			workers = workers;
		});

		socket.on('task:timeout', ({ snakeId, type, queue, identity, runId }) => {
			for (const worker of Object.values(workers)) {
				worker.workflows.delete(snakeId);
			}
			// console.log(snakeId, 'task timeout', { type, queue, identity, runId }, `http://localhost:8233/namespaces/default/workflows/${snakeId}/${runId}/history`);
			workers = workers;
		});

		socket.on('worker:stop', ({ identity, time }) => {
			console.log('worker:stop', { identity, time });
			const worker = workers[identity];
			if (!worker) {
				return;
			}
			worker.state = 'stopped';
      worker.stoppedAt = time;
			worker.workflows.clear();
			workers = workers;
		});
	});

	const moveTowardApple = (snake: Snake): Direction => {
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

		let preferredDirections: Direction[] = [];

		if (nearestApple) {
			const deltaX = nearestApple.x - head.head.x;
			const deltaY = nearestApple.y - head.head.y;

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
		}
		const direction = preferredDirections[Math.floor(Math.random() * preferredDirections.length)];

		// We have to go somewhere, so pick a random direction if we can't decide.
		return direction || randomDirection();
	};

	const randomDirection = (): Direction => {
		return ['up', 'left', 'right', 'down'][Math.floor(Math.random() * 4)] as Direction;
	};

	const steerRandomSnake = () => {
		const snakes = Object.values(Snakes);
		const snake = snakes[Math.floor(Math.random() * snakes.length)];
		const currentDirection = snake.snake.segments[0].direction;
		const desiredDirection = moveTowardApple(snake.snake);
		if (desiredDirection != currentDirection) {
			socket.emit('snakeChangeDirection', { id: snake.id, direction: desiredDirection });
		}
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
		<p class="retro"><a class="text-white" href="/">&larr; Back home</a></p>
	{/if}
	{#if roundLoading}
		<h2 class="retro">Loading...</h2>
	{/if}
</div>
<div id="game">
	<canvas id="board" bind:this={boardCanvas} />
	<canvas bind:this={appleCanvas} />
	<!-- TODO: Make this dynamic based on player count -->
	{#each GAME_CONFIG.teamNames as team}
		{#each SNAKE_NUMBERS as i}
			<canvas bind:this={snakeCanvases[`${team}-${i}`]} />
		{/each}
	{/each}
</div>
<div id="score">
	<div class="retro" id="time">{timeLeft}</div>
	{#each GAME_CONFIG.teamNames as team}
		<div class="retro" id={team}>{scores[team] || 0}</div>
	{/each}
</div>

{#if showWorkers}
	<div id="workers">
		{#each workerIds as id}
			{@const worker = workers[id]}
			{#if worker.state == 'running'}
				<div class="worker worker-running">
					{worker.workflows.size > 0 ? '🐍'.repeat(worker.workflows.size) : '😴'}
				</div>
			{:else if worker.state == 'stopped'}
				<div class="worker worker-stopped">☠️</div>
			{:else}
				<div class="worker worker-unknown">?</div>
			{/if}
		{/each}
	</div>
{/if}

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
		width: calc(90vw - 28px);
		height: calc(100vh - 28px);
		overflow: hidden;
	}
	#board {
		border: 1px solid #59fda0;
	}

	#score {
		@apply absolute top-0 right-0 w-[10vw] flex flex-col gap-0 text-3xl text-center text-white overflow-hidden;
	}

	#score .retro {
		font-weight: bold;
		font-size: 2rem;
	}

	.worker {
		@apply py-2;
	}

	.worker-running {
		background-color: #0f0;
	}

	.worker-stopped {
		background-color: #f00;
	}

	.worker-unknown {
		background-color: #121212;
	}

	#time {
		@apply bg-white py-4 text-black;
	}

	#blue {
		@apply bg-[blue] py-4;
	}

	#red {
		@apply bg-[red] py-4;
	}

	#orange {
		@apply bg-[orange] py-4;
	}

	#workers {
		@apply bg-[green] absolute bottom-0 right-0 w-[10vw] flex flex-col gap-0 text-3xl text-center text-white overflow-hidden;
	}
</style>
