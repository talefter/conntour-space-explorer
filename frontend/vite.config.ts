import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/sources': 'http://localhost:5000',
      '/search': 'http://localhost:5000',
      '/history': 'http://localhost:5000'
    }
  }
})