import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Alpha-Watch',
        short_name: 'Alpha-Watch',
        description: 'Your crypto companion for tracking prices, news, and market trends.',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'alphawatch-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'alphawatch-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
