<script lang="ts">
	import { onMount } from 'svelte';
	import { demoResult } from './demo';
	import { CELL_SIZE } from '$lib/snake/constants';

	let SnakeRound;
	let container;
	let canvas;
	let socket;

	let width = 50;
	let height = 25;
	let snakesPerTeam = 2;

	let gameState = { players: {}, food: { x: 0, y: 0 } };
	const round = demoResult.result.outcome.success[0];

	onMount(async () => {
		// socket = io();
		// socket.on('gameState', (state) => {
		//   gameState = state;
		// });

		SnakeRound = (await import('$lib/snake/Round')).default;
		const cxt = canvas.getContext('2d');
		if (cxt) {
			new SnakeRound(cxt, round, width, height, snakesPerTeam);
		}
	});
</script>

<div id="game" bind:this={container}>
	<canvas bind:this={canvas} width={width * CELL_SIZE} height={height * CELL_SIZE} />
	<div id="score">
		<div id="time" />
		<div id="blue" />
		<div id="red" />
	</div>
</div>

<style>
	#game {
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
