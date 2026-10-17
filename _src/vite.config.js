import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        cafe: resolve(__dirname, 'work/cafe/index.html'),
        clinic: resolve(__dirname, 'work/clinic/index.html'),
        interior: resolve(__dirname, 'work/interior/index.html'),
        academy: resolve(__dirname, 'work/academy/index.html'),
      },
    },
  },
})
