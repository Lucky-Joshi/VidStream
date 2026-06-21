import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['events', 'util', 'process'],
      globals: {
        process: true,
        global: true,
      },
    }),
  ],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['simple-peer'],
  },
});
