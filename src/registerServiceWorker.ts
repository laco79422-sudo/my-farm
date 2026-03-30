import { useToastStore } from './stores/useToastStore';

const SW_SCRIPT = '/sw.js';

/**
 * PWA: 빌드된 서비스 워커를 등록하고, 업데이트 시 안내 후 새로고침합니다.
 * - updatefound: 새 SW 설치 감지
 * - controllerchange: 활성 SW 교체 시 한 번 새로고침 (첫 제어권 획득은 제외)
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  let skipNextControllerReload = !navigator.serviceWorker.controller;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (skipNextControllerReload) {
      skipNextControllerReload = false;
      return;
    }
    window.location.reload();
  });

  void (async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_SCRIPT, {
        scope: '/',
        updateViaCache: 'none',
      });

      reg.addEventListener('updatefound', () => {
        // skipWaiting이 있으면 `installed` 상태가 거의 보이지 않을 수 있어, 여기서 안내
        if (!navigator.serviceWorker.controller) return;

        useToastStore
          .getState()
          .show('새 업데이트가 적용되었습니다. 곧 화면이 새로고침됩니다.');
      });

      const pingUpdate = () => {
        void reg.update();
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') pingUpdate();
      });
      window.addEventListener('focus', pingUpdate);
    } catch (e) {
      console.error('[PWA] Service worker registration failed', e);
    }
  })();
}
