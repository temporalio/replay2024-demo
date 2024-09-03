<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { io }	from 'socket.io-client';
	import { registerPlayer } from '$lib/utilities/game-controls';

	$: ({ id: workflowId } = $page.params);

  export let team: 'red' | 'blue';
	const socket = io();
  let name = ''

  const register = async () => {
		await registerPlayer(socket, team, name);
    goto(`/${workflowId}/lobby`);
	}
</script>

<svelte:head>
	<title>Register for Team</title>
	<meta name="description" content="Temporal Snakes" />
</svelte:head>

<section>
	<h1 class="text-{team}-600 font-bold">{team.toUpperCase()} TEAM</h1>
	<div class="flex flex-col gap-4 text-center justify-center">
    <input autofocus class="p-4" type="text" bind:value={name} placeholder="Enter your name" />
		<button class="retro" on:click={register}>Register</button>
	</div>
</section>
