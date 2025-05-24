// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import VueRouter from 'unplugin-vue-router/vite'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Components(),
    ViteFonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
  ],
  optimizeDeps: {
    exclude: [
      'vuetify',
      'vue-router',
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic',
    ],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve('../key.pem')),
      cert: fs.readFileSync(path.resolve('../cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/estudiantes': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/personas': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/docentes': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/asignaturas': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/categoriaEmpleados': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/contratos': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/inscripciones': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})