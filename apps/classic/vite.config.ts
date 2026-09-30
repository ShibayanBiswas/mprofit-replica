import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // 127.0.0.1, not localhost: another local app already owns IPv6 port 3001.
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
});
