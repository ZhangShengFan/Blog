export const registerServiceWorker = () => {
  if (import.meta.env.DEV || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) {
        return;
      }

      refreshing = true;
      window.location.reload();
    });

    void navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        void registration.update();

        if (registration.waiting && hadController) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
  });
};
