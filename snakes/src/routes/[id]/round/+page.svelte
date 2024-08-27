<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { CELL_SIZE } from '$lib/snake/constants';
	import { page } from '$app/stores';
	import { io, Socket } from 'socket.io-client';
	import type { Round, Snake } from '$lib/snake/types';
	import SnakeBody from '$lib/snake/SnakeBody';

	$: ({ id: workflowId } = $page.params);

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
		width = config.width;
		height = config.height;
		SnakeRound = (await import('$lib/snake/Round')).default;
		const cxt = backgroundCanvas.getContext('2d');

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

	onDestroy (() => {
		if (socket) {
				socket.disconnect();
		}
	});
</script>

<div id="game" bind:this={container}>
	<canvas bind:this={backgroundCanvas} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<!-- TODO: Make this dynamic based on player count -->
	<canvas bind:this={snakeCanvas1} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvas2} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvas3} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<canvas bind:this={snakeCanvas4} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<div id="score">
		<div id="time" />
		<div id="blue" />
		<div id="red" />
	</div>
</div>

<style>
	#game, #game canvas {
		position: absolute;
		top: 0;
		right: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	#score {
		position: absolute;
		top: 0;
		right: 0;
		padding: 10px;
		font-size: 36px;
		font-weight: bold;
		text-align: center;
		background: rgba(0, 0, 0, 0.5);
	}

	#time {
		color: white;
	}

	#blue {
		color: blue;
	}

	#red {
		color: red;
	}
</style>
