import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getOrchestratorConfig, saveOrchestratorConfig, publishToGit } from './scripts/orchestratorService.js'

function orchestratorDevPlugin() {
  return {
    name: 'orchestrator-dev-api',
    configureServer(server) {
      server.middlewares.use('/orchestrator-api', (req, res) => {
        const url = req.url || '/'
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'GET' && (url === '/config' || url === '/')) {
          const config = getOrchestratorConfig()
          if (!config) {
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Config not found' }))
          }
          res.statusCode = 200
          return res.end(JSON.stringify(config))
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const payload = body ? JSON.parse(body) : {}
              if (url === '/save') {
                const saved = saveOrchestratorConfig(payload.config, payload.adminUser)
                res.statusCode = 200
                return res.end(JSON.stringify({ success: true, config: saved }))
              }

              if (url === '/publish') {
                const result = publishToGit({
                  config: payload.config,
                  commitMessage: payload.commitMessage,
                  adminUser: payload.adminUser
                })
                res.statusCode = 200
                return res.end(JSON.stringify(result))
              }

              res.statusCode = 404
              return res.end(JSON.stringify({ error: 'Endpoint not found' }))
            } catch (err) {
              res.statusCode = 500
              return res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        res.statusCode = 405
        return res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    orchestratorDevPlugin(),
  ],
  server: {
    port: 5175,
    watch: {
      ignored: ['**/src/data/orchestratorConfig.json', '**/src/data/departmentUsers.js']
    },
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
