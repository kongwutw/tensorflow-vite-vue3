import * as path from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const proxyUrl = 'http://localhost:9000';

export default defineConfig({
  base: '/',
  server: {
    port: 9001, 
    open: true,
    proxy: {
      '/api': {
        target: proxyUrl,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [vue({
    script: {
      refTransform: true,
    }
  })]
})
