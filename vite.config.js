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
      '/api/service': {
        target: 'https://mt-otolink-api-stage.otolink.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/service-locations': {
        target: 'https://mt-otolink-api-stage.otolink.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/leads/generate-token': {
        target: 'https://mt-otolink-api-stage.otolink.app',
        changeOrigin: true,
        secure: false,
      },
      '/otolink-api': {
        target: 'https://mt-otolink-api-stage.otolink.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/otolink-api/, '')
      },
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
      },
      '/zofeur-api': {
        target: 'https://api.zofeur.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/zofeur-api/, '')
      }
    }
  }
})
