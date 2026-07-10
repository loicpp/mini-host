import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    host: '127.0.0.1'
  },
  build: {
    rollupOptions: {
      external: ['react-native-fs', 'fs', 'path', 'buffer']
    }
  }
})
