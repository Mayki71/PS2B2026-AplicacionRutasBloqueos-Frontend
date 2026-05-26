import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
  ],
  server: {
    host: true,
    https: true,
    proxy: {
      // Redirige las peticiones /api al backend para evitar errores de "Mixed Content"
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, 
      }
    }
  }
})