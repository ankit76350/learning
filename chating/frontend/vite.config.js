import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // sockjs-client references `global`, which Vite doesn't define in the browser.
  define: {
    global: 'globalThis',
  },
})
