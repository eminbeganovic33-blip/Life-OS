import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rolldown (Vite 8 experimental) has parser issues with IIFE patterns in JSX.
  // Use stable Rollup until rolldown RC stabilises.
  builder: "rollup",
})
