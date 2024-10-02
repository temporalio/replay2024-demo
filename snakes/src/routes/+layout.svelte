<script>
	import '../app.css';
</script>

<div class="flex flex-col min-h-screen">
	<main class="flex flex-col justify-center">
		<slot />
	</main>
	<footer class="absolute right-2 bottom-2 flex flex-col items-center gap-1">
		<p class="built-by">Built by</p>
		<div class="flex items-center gap-1">
			<a href="https://github.com/robholland" target="_blank" rel="noopener noreferrer">
				<img class="rounded-full" alt="Rob" src="https://avatars.githubusercontent.com/u/9563?s=60&amp;v=4" height="30" width="30">
			</a>
			<a href="https://github.com/Alex-Tideman" target="_blank" rel="noopener noreferrer">
				<img class="rounded-full" alt="Alex" src="https://avatars.githubusercontent.com/u/7967403?s=60&v=4" height="30" width="30">
			</a>
			<a href="https://github.com/steveandroulakis" target="_blank" rel="noopener noreferrer">
				<img class="rounded-full" alt="Steve" src="https://avatars.githubusercontent.com/u/1109055?s=60&v=4" height="30" width="30">
			</a>
		</div>
	</footer>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		padding: 1rem;
		margin: 0 auto;
		box-sizing: border-box;
		overflow: hidden;
		max-width: 100vw;
	}
</style>
