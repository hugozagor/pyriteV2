import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API + media calls to the Spring Boot backend during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
})
