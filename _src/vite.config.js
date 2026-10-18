import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
export default defineConfig({
  plugins: [react()],
  base: '/',
  // React 대신 같은 사용법의 Preact를 써서 모든 페이지가 받는 공통 스크립트를 줄인다(압축 기준 약 40KB).
  resolve: {
    alias: { react: 'preact/compat', 'react-dom/client': 'preact/compat/client', 'react-dom': 'preact/compat', 'react/jsx-runtime': 'preact/jsx-runtime' },
  },
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
        detail: resolve(__dirname, 'work/detail/index.html'),
      },
    },
  },
})
