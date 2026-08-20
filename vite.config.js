import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Основная конфигурация Vite + PWA.
// Стратегия офлайна: precache статики (app shell) через Workbox,
// плюс runtime-кэш для ответов Claude (NetworkFirst — если офлайн, отдаём
// последний закэшированный ответ, если он есть; иначе модуль должен
// показать понятную заглушку "Нужен интернет для ИИ-функций").
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: false, // используем свой public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Serverless-функции (Anthropic proxy) — сеть в приоритете,
            // короткий таймаут, чтобы UI не подвисал в плохой сети.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Локальная разработка: `vercel dev` поднимает api/* на 3000
      '/api': 'http://localhost:3000',
    },
  },
});
