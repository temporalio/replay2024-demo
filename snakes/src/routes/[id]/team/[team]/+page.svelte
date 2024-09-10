<script lang="ts">
	import { page } from '$app/stores';
	import { io }	from 'socket.io-client';
	import type { Lobby, Snake, Direction } from '$lib/snake/types';
    import playerId from '$lib/stores/playerId';

	$: ({ id: workflowId } = $page.params);
    const { team } = $page.params;

    // Allow overriding playerId in the URL for testing
    const pID = $page.url.searchParams.get('playerId') || $playerId;

	const lobbySocket = io(`/lobby`, {
        auth: { id: pID, team: team }
    });
    const gameSocket = io();

	let players = 0;
    let invite: ((id: string) => void) | undefined;
    let accepted = false;
    let playing = false;
    let snake: Snake | undefined;

	lobbySocket.on('lobby', ({ lobby }: { lobby: Lobby }) => {
		players = lobby.teams[team]?.players;
	});

    lobbySocket.on('roundInvite', (cb) => {
        snake = undefined;
        setupInvite(cb);
    })

    lobbySocket.on('roundReady', () => {
        resetInvite();
    });

    lobbySocket.on('roundPlaying', ({ snake: playerSnake }: { snake: Snake }) => {
        snake = playerSnake;
        playing = true;
    });

    lobbySocket.on('roundFinished', () => {
        playing = false;
    });

    const setupInvite = (cb: ((id: string) => void)) => {
        invite = cb;
        accepted = false;
    }

    const resetInvite = () => {
        invite = undefined;
        accepted = false;
    }

    const acceptInvite = () => {
        if (invite) {
            invite(pID);
            invite = undefined;
            accepted = true;
        }
    };

    const onMove = (direction: Direction) => {
        if (snake) {
            gameSocket.emit('snakeChangeDirection', { id: snake.id, direction });
        }
        return false;
    };

</script>

<svelte:head>
	<title>{team.toUpperCase()} Lobby</title>
</svelte:head>

{#if snake && playing}
<div class="flex flex-col items-center gap-6 text-6xl">
    <div class="w-16 h-16 rounded border-2 bg-{snake.teamName}-600" 
      class:border-white={snake.id.endsWith('-0')}
      class:border-black={snake.id.endsWith('-1')}
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
{:else}
<section>
	<h1 class="retro">{team.toUpperCase()} Lobby</h1>
	<div class="flex flex-col gap-4 justify-center">
		<div class="flex gap-4">
			<div class="border-{team}-500 border-4 rounded-xl p-24 text-white">
                {#if invite}
                <div class="invited">
                    <button class="retro" on:click={acceptInvite}>Accept Invite</button>
                </div>
                {:else if accepted}
                <div class="invite-accepted">
                    <p>Invite Accepted</p>
                    <p>Please wait...</p>
                </div>
                {/if}
				<div class="player-count" id="players">
					Players: {players}
				</div>
			</div>
		</div>
	</div>
</section>
{/if}