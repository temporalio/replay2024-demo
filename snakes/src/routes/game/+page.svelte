<script lang="ts">
  import { onMount } from 'svelte';

  let Game;
  let container;
  let canvas;

  let width = 3000;
  let height = 3000;

  let socket;
  let gameState = { players: {}, food: { x: 0, y: 0 } };

  onMount(async () => {
    // socket = io();
    // socket.on('gameState', (state) => {
    //   gameState = state;
    // });

    setDimensions();

    Game = (await import('$lib/snake/Game')).default;
    const cxt = canvas.getContext('2d');
    if (cxt) {
      new Game(cxt, width, height);
    }
  });

  function setDimensions() {
    width = container.clientWidth;
    height = container.clientHeight;
  }
</script>

<div id="game" bind:this={container} on:resize={setDimensions}>
  <canvas bind:this={canvas} width={width} height={height} />
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