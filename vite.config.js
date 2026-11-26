import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Stamp public/sw.js with a per-build id so each deploy rotates SW caches
// (a hand-bumped CACHE_VERSION was stuck at v3-2026-05-11 and the runtime
// cache grew with every deploy).
function stampServiceWorker() {
  let outDir = 'dist'
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    configResolved(cfg) { outDir = cfg.build.outDir },
    closeBundle() {
      const file = resolve(outDir, 'sw.js')
      if (!existsSync(file)) return
      const id = `b-${Date.now().toString(36)}`
      const assetsDir = resolve(outDir, 'assets')
      const assets = existsSync(assetsDir)
        ? readdirSync(assetsDir).filter((f) => /\.(js|css)$/.test(f)).map((f) => `/assets/${f}`)
        : []
      const src = readFileSync(file, 'utf8')
        .replace('"__BUILD_ID__"', JSON.stringify(id))
        .replace('[] /* __BUILD_ASSETS__ */', JSON.stringify(assets))
      writeFileSync(file, src)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  // Rolldown (Vite 8 experimental) has parser issues with IIFE patterns in JSX.
  // Use stable Rollup until rolldown RC stabilises.
  builder: "rollup",
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large 3rd-party libs into their own chunks so the main bundle
        // isn't a single 1.1MB blob. These deps change rarely → cache well.
        // Firebase is NOT listed: it's only reached via dynamic import
        // (src/firebase.js → firebaseClient.js), so it is never preloaded.
        manualChunks: {
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
