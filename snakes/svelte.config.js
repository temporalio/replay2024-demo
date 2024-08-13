import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter()
  },
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
