import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-icons', 'sonner', 'react-infinite-scroll-component'],
          'state-vendor': ['zustand'],
          'socket-vendor': ['socket.io-client']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
