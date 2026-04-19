import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  define: {
    global: 'window',
    'process.env': {},
    process: {
      env: {},
    },
    Buffer: 'window.Buffer || []',
  },
})
