<script lang="ts">
	import { goto } from '$app/navigation';

	const input = {
		width: 10,
		height: 10,
		snakesPerTeam: 2,
		teams: [{ name: 'Red' }, { name: 'Blue' }]
	};

	const startGame = async () => {
		const response = await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ action: 'start', input })
		});
		const { workflowId } = await response.json();
		goto(`/game/${workflowId}`);
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Snakes</h1>
	<button on:click={startGame}> Start Game </button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		font-family: 'VT323', 'Courier New', monospace; /* Retro computer font */
		font-size: 3rem;
		color: #ff00ff; /* Neon pink */
		text-shadow:
			3px 3px 0 #00ffff,
			/* Cyan offset shadow */ 6px 6px 0 #ff00ff,
			/* Pink offset shadow */ -2px -2px 10px rgba(255, 0, 255, 0.7),
			/* Neon glow */ 2px 2px 10px rgba(0, 255, 255, 0.7); /* Neon glow */
		letter-spacing: 4px;
		text-transform: uppercase;
		margin-bottom: 20px;
		position: relative;
		z-index: 1;
	}

	h1::before {
		content: attr(data-text);
		position: absolute;
		left: 2px;
		top: 2px;
		color: rgba(0, 255, 255, 0.5); /* Cyan ghost text */
		z-index: -1;
	}

	h1::after {
		content: attr(data-text);
		position: absolute;
		left: -2px;
		top: -2px;
		color: rgba(255, 0, 255, 0.5); /* Pink ghost text */
		z-index: -2;
	}

	button {
		padding: 15px 30px;
		font-size: 18px;
		font-family: 'Helvetica', sans-serif;
		text-transform: uppercase;
		letter-spacing: 2px;
		font-weight: bold;
		color: #ffffff;
		background: linear-gradient(45deg, #ff00ff, #00ffff);
		border: none;
		border-radius: 5px;
		box-shadow:
			0 0 10px rgba(255, 0, 255, 0.5),
			0 0 20px rgba(0, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	button:before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5));
		transform: rotate(45deg);
		transition: all 0.3s ease;
	}

	button:hover {
		transform: scale(1.05);
		box-shadow:
			0 0 20px rgba(255, 0, 255, 0.7),
			0 0 40px rgba(0, 255, 255, 0.7);
	}

	button:hover:before {
		top: -100%;
		left: -100%;
	}

	button:active {
		transform: scale(0.95);
	}
</style>
