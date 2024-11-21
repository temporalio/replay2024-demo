<script>
	import '../app.css';
</script>

<div class="flex flex-col min-h-screen">
	<main class="flex flex-col justify-center">
		<slot />
	</main>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		margin: 0 auto;
		box-sizing: border-box;
		overflow: hidden;
		max-width: 100vw;
	}
</style>
