import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // sockjs-client expects a Node-style `global`; map it to the browser globalThis
  define: {
    global: 'globalThis',
  },
})
