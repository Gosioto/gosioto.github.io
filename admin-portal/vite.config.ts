import path from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Бэкенд должен быть запущен (например: .\run-backend.ps1). Иначе будет ECONNREFUSED.
// Адрес бэкенда можно задать через VITE_PROXY_TARGET (по умолчанию http://localhost:8080).
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8080';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  /** `npm run dev:https` → `vite --mode https`: нужен secure context для микрофона/экрана по LAN IP в Chromium-based браузерах. */
  const useHttps = mode === 'https' || env.VITE_DEV_HTTPS === '1' || env.VITE_DEV_HTTPS === 'true';

  return {
    base: '/',
    plugins: [react(), ...(useHttps ? [basicSsl()] : [])],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: {
      port: 5173,
      /** Доступ с других машин в LAN/VPN (например RadminVPN); иначе только localhost. */
      host: true,
      proxy: {
        '/api': { target: proxyTarget, changeOrigin: true, ws: true },
        '/health': { target: proxyTarget, changeOrigin: true },
      },
    },
    test: {
      globals: false,
      environment: 'node',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      coverage: {
        provider: 'v8',
        include: ['src/voice/**/*.ts'],
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
        // branches: защита `typeof DOMException !== 'undefined'` даёт непокрываемую ветку в Node (глобал всегда есть).
        thresholds: {
          lines: 99,
          functions: 99,
          branches: 95,
          statements: 99,
        },
      },
    },
  };
});
