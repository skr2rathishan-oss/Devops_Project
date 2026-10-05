import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Both are set only by the client-dev service in docker-compose.yml; plain `npm run dev` is unaffected.
const apiProxyTarget = process.env.API_PROXY_TARGET
const usePolling = process.env.VITE_USE_POLLING === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api to the backend container, like nginx does in production.
    proxy: apiProxyTarget ? { '/api': apiProxyTarget } : undefined,
    // File change events don't reach containers from a Windows/macOS bind mount.
    watch: usePolling ? { usePolling: true, interval: 300 } : undefined,
  },
})
