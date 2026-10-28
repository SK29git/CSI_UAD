import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'https://ccaas.agmcgroup.ae',
        changeOrigin: true,
        secure: false,
      },
      '/sms-gateway': {
        target: 'https://agmcutil.agmcgroup.ae',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sms-gateway/, '')
      }
    }
  }
})
