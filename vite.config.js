import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rolldown (Vite 8 experimental) has parser issues with IIFE patterns in JSX.
  // Use stable Rollup until rolldown RC stabilises.
  builder: "rollup",
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large 3rd-party libs into their own chunks so the main bundle
        // isn't a single 1.1MB blob. These deps change rarely → cache well.
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
