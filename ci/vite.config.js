import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The same wiring as a consuming project: mini_vue is reached as src/mini
// through the '@' alias, with preserveSymlinks so its imports of 'vue' and
// the rest resolve from this folder's node_modules. src/mini is a symlink to
// the repo root that the CI job creates; it isn't committed, because a link
// back to the root would loop for every project that links mini_vue in.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    preserveSymlinks: true,
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: { entry: 'main.js', formats: ['es'], fileName: 'barrels' },
  },
})
