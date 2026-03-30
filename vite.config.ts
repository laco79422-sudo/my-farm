import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        id: '/',
        name: '나만의 농장',
        short_name: '나만의 농장',
        description:
          '사진 한 장으로 식물과 작물을 진단하고, 키우고 기록하며 보상까지 받는 스마트 농장 플랫폼',
        theme_color: '#1a5f2a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'ko',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // 해시가 붙은 JS/CSS + 정적 파일만 프리캐시 (빌드마다 매니페스트 갱신)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // 문서 요청은 네트워크 우선 → 배포 직후 index도 가능한 한 최신
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-documents',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 16,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
