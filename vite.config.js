import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/App/components'),
      '@popup': resolve(__dirname, './src/Popup')
    }
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'popup.html')  // Добавляем точку входа для popup
      },
      output: {
        // Генерируем читаемые имена чанков для лучшей отладки
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        compact: true,
        experimentalMinChunkSize: 10000,
        // Настраиваем стратегию разделения кода
        manualChunks: (id) => {
          // Внешние зависимости в отдельный чанк
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          // Компоненты приложения в отдельный чанк
          if (id.includes('/App/components/')) {
            return 'app-components'
          }
          // Компоненты popup в отдельный чанк
          if (id.includes('/Popup/components/')) {
            return 'popup-components'
          }
          // Остальной код popup
          if (id.includes('/Popup/')) {
            return 'popup'
          }
          // Остальной код приложения
          if (id.includes('/App/')) {
            return 'app'
          }
        }
      }
    }
  }
})