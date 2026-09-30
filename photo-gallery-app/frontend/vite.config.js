import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'show-live-url',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          setTimeout(() => {
            console.log('\x1b[36m  ➜  Live Vercel:\x1b[0m \x1b[4mhttps://photo-album-18.vercel.app\x1b[0m');
          }, 150);
        });
      },
    },
  ],
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
})
