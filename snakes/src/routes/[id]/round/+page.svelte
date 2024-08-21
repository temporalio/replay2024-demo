<script lang="ts">
	import { onMount } from 'svelte';
	import { CELL_SIZE } from '$lib/snake/constants';
	import { page } from '$app/stores';

	$: ({ id: workflowId } = $page.params);

	let SnakeRound;
	let container;
	let canvas;
	let socket;

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
		// socket = io();
		// socket.on('gameState', (state) => {
		//   gameState = state;
		// });
		//
		const { round, config } = await fetchState();
		width = config.width;
		height = config.height;
		SnakeRound = (await import('$lib/snake/Round')).default;
		const cxt = canvas.getContext('2d');
		if (cxt) {
			new SnakeRound(cxt, round, config);
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
