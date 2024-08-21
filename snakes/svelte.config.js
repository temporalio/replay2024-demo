import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  kit: {
    adapter: adapter()
  },
  preprocess: vitePreprocess(),
  vite: {
    server: {
      proxy: {
        '/socket.io': {
          target: 'ws://localhost:3000',
          ws: true
        }
      }
    }
  }
};
