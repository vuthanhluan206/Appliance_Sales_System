import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // Railway inject PORT — frontend lắng nghe đúng port
    port: parseInt(process.env.PORT) || 4173,
    host: '0.0.0.0',
    allowedHosts: 'all',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
