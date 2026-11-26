import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/dist/**', '**/public/**', '**/*.zip', '**/*.html', '**/media/**']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '^/.*\\.zip$': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
});
