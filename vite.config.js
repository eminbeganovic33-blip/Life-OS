import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rolldown (Vite 8 experimental) has parser issues with IIFE patterns in JSX.
  // Use stable Rollup until rolldown RC stabilises.
  builder: "rollup",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/firebase")) return "firebase";
          if (id.includes("node_modules/framer-motion")) return "framer-motion";
          if (id.includes("node_modules/lucide-react")) return "lucide";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "react";
        },
      },
    },
  },
})
