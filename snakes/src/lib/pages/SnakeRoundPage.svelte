<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { CELL_SIZE } from '$lib/snake/constants';
	import { page } from '$app/stores';
	import { io, Socket } from 'socket.io-client';
	import type { Snake, Team } from '$lib/snake/types';
	import SnakeBody from '$lib/snake/SnakeBody';

	$: ({ id: workflowId } = $page.params);

	export let isDemo = false;
	
	let socket: Socket;

	let RoundData;
	let SnakeRound;
	let SnakeRed1: SnakeBody;
	let SnakeRed2: SnakeBody;
	let SnakeBlue1: SnakeBody;
	let SnakeBlue2: SnakeBody;

	let container;
	let backgroundCanvas;
	let snakeCanvas1;
	let snakeCanvas2;
	let snakeCanvas3;
	let snakeCanvas4;

	let width = 100;
	let height = 100;
  let roundOver = false;
  let demoInterval;

	let redScore = 0;
	let blueScore = 0;

	function connectSocket() {
		socket = io();

		socket.on('snakeMoved', (id, segments) => {
			if (id === 'red-0') {
				SnakeRed1.redraw(segments);
			} else if (id === 'red-1') {
				SnakeRed2.redraw(segments);
			} else if (id === 'blue-0') {
				SnakeBlue1.redraw(segments);
			} else if (id === 'blue-1') {
				SnakeBlue2.redraw(segments);
			}
		});

		socket.on('roundUpdate', (update) => {
			redScore = update.teams.find((team: Team) => team.name === 'red')?.score || 0;
			blueScore = update.teams.find((team: Team) => team.name === 'blue')?.score || 0;
      if (update?.finished) {
        roundOver = true;
        clearInterval(demoInterval);
        demoInterval = null;
      }
		});

		socket.on('connect_error', (error) => {
			console.error('Socket.io connection error:', error);
			setTimeout(connectSocket, 1000);
		});
	}

	const fetchState = async () => {
		const response = await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ action: 'queryState', workflowId })
		});
		const result = await response.json();
		if (result[0]) {
			return result[0];
		}
		alert('No game state found');
	};

	onMount(async () => {
		const { round, config } = await fetchState();
		if (round.finished) {
			roundOver = true;
		}
		width = config.width;
		height = config.height;
		SnakeRound = (await import('$lib/snake/Round')).default;
		const cxt = backgroundCanvas.getContext('2d');

		if (isDemo) {
			demoInterval = setInterval(moveRandomSnake, 50);
		}


		const getSnake = (id: string) => {
			const snake = round.snakes.find((snake: Snake) => snake.id === id);
			return snake
		}
		// TODO: Make this dynamic based on player count

		connectSocket();
		RoundData = new SnakeRound(cxt, round, config, socket);
		SnakeRed1 = new SnakeBody(RoundData, snakeCanvas1.getContext('2d'), getSnake('red-0'), socket);
		SnakeRed2 = new SnakeBody(RoundData, snakeCanvas2.getContext('2d'), getSnake('red-1'), socket);
		SnakeBlue1 = new SnakeBody(RoundData, snakeCanvas3.getContext('2d'), getSnake('blue-0'), socket);
		SnakeBlue2 = new SnakeBody(RoundData, snakeCanvas4.getContext('2d'), getSnake('blue-1'), socket);
	});

	const moveRandomSnake = () => {
    const snakes = ['red-0', 'red-1', 'blue-0', 'blue-1'];
    const direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
    const snake = snakes[Math.floor(Math.random() * snakes.length)];
    socket.emit('snakeChangeDirection', snake, direction);
  }

	onDestroy (() => {
		if (socket) {
				socket.disconnect();
		}
		clearInterval(demoInterval);
    demoInterval = null;
	});
</script>


<div class="flex flex-col items-center justify-center">
	{#if isDemo}
		<h2 class="retro">Demo</h2>
	{/if}
  {#if roundOver}
    <h2 class="retro">Round Over</h2>
		{#if isDemo}
			<p class="retro"><a class="text-white" href={`/`}>&larr; Back to Home</a></p>
		{:else}
			<p class="retro"><a class="text-white" href={`/${workflowId}/lobby`}>&larr; Back to Lobby</a></p>
		{/if}
  {/if}
</div>
<div id="game" bind:this={container}>
	<canvas bind:this={backgroundCanvas} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<!-- TODO: Make this dynamic based on player count -->
	<canvas bind:this={snakeCanvas1} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvas2} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvas3} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvas4} width={width * CELL_SIZE} height={height * CELL_SIZE} />
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
