import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies API + websocket to the Node backend on :3000
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
});
