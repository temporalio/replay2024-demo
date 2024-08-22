<script lang="ts">
	import { onMount } from 'svelte';
	import { CELL_SIZE } from '$lib/snake/constants';
	import { page } from '$app/stores';

	$: ({ id: workflowId } = $page.params);

	let SnakeRound;
	let container;
	let backgroundCanvas;
	let snakeCanvas1;
	let snakeCanvas2;
	let snakeCanvas3;
	let snakeCanvas4;

	let width = 100;
	let height = 100;

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
		// TODO: Make this dynamic based on player count
		const snakeCanvasCxts = [
			snakeCanvas1.getContext('2d'),
			snakeCanvas2.getContext('2d'),
			snakeCanvas3.getContext('2d'),
			snakeCanvas4.getContext('2d'),
		];
		if (cxt) {
			new SnakeRound(cxt, snakeCanvasCxts, round, config);
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
