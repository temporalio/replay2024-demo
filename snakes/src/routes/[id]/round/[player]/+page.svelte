<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { page } from '$app/stores';

	let socket: Socket;

  $: ({ player } = $page.params);

  $: color = player.includes('red') ? 'red' : 'blue';
  $: number = player.includes('1') ? 1 : 0;

	onMount(async () => {
		socket = io();
		socket.on('connect_error', (error) => {
			if (socket.active) {
				console.error('Socket.io connection error (will retry):', error);
				setTimeout(socket.connect, 1000);
			}
		});
	});

  const onMove = (direction: string) => {
    if (direction) {
      socket.emit('snakeChangeDirection', { id: player, direction });
    }
    return false;
  };

  onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}
	});
</script>

<div class="flex flex-col items-center gap-6 text-6xl">
  <div class="w-16 h-16 rounded border-2" 
    class:border-white={number === 0} 
    class:border-black={number === 1} 
    class:bg-red-600={color === 'red'}
    class:bg-blue-600={color === 'blue'}
    />
  <button class="mx-auto" on:click={() => onMove('up')}>&#8593;</button>
  <div class="flex gap-6">
    <button on:click={() => onMove('left')}>&#8592;</button>
    <button on:click={() => onMove('right')}>&#8594;</button>
  </div>
  <button class="mx-auto" on:click={() => onMove('down')}>&#8595;</button>
</div>

<style lang="postcss">
  button {
    @apply flex items-center justify-center border-4 border-white h-32 w-32;
  }

  button:hover, button:active {
    @apply bg-gray-600;
  }
</style>