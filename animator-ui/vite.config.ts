import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5174,
    host: '127.0.0.1'
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['react-native-fs', 'fs', 'path', 'buffer'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
