import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/mercadona-api': {
        target: 'https://tienda.mercadona.es/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mercadona-api/, '')
      }
    }
  }
})
