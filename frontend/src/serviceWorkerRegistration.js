// frontend/src/serviceWorkerRegistration.js
// Minimal service worker registration for CRA or manual bundler
export function register() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}
export function unregister() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(reg => reg.unregister());
}
