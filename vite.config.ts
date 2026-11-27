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
      '/slides': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/scorm_player': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '^/.*\\.(png|jpg|jpeg|gif|webp|svg|mp3|mp4|wav|ogg|m4a|webm|mov)(\\?.*)?$': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        bypass: (req) => {
          const url = req.url || '';
          if (url.startsWith('/src/') || url.startsWith('/node_modules/') || url.startsWith('/@')) {
            return req.url;
          }
          return undefined;
        }
      },
      '^/.*\\.zip(\\?.*)?$': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '^/.*\\.html(\\?.*)?$': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        bypass: (req) => {
          const url = req.url || '';
          const pathname = decodeURIComponent(url.split('?')[0]);
          if (pathname === '/' || pathname === '/index.html' || pathname.startsWith('/src/') || pathname.startsWith('/@') || pathname.startsWith('/node_modules/')) {
            return req.url;
          }
          return undefined;
        }
      }
    }
  }
});
