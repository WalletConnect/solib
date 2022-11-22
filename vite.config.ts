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
  resolve: {
    alias: {
      '@web3modal/core': fs.existsSync(path.resolve(__dirname, './node_modules/@web3modal/core'))
        ? '@web3modal/core'
        : path.resolve(__dirname, './src/utils/w3mcore')
    }
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
