// vite.config.js
import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id)

export default defineConfig(() => ({
  esbuild: {},
  define: {
    global: {}
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      name: 'Solib'
    },
    minify: 'esbuild',
    rollupOptions: {
      external: isExternal
    }
  },
  plugins: []
}))
