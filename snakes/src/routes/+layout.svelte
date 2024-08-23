<script>
	import '../app.css';
</script>

<div class="app">
	<main class="flex flex-col justify-center">
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		padding: 1rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
