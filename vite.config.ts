import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  define: {
    'import.meta.env.VITE_GITHUB_URL': JSON.stringify(
      process.env.VITE_GITHUB_URL || '#'
    )
  },
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'material-icons': ['@material-design-icons/font'],
          'plotly': ['plotly.js-basic-dist-min'],
          'three': ['three']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    tailwindcss(),
    vue(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'Vizmo',
        short_name: 'vizmo',
        description: 'Visualization of IMU in realtime or replay',
        theme_color: '#0000FF',
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })
  ],
})