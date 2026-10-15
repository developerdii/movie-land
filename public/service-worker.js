// Cleanup service worker.
//
// The previous Vue CLI build registered a PWA service worker that precached the
// old app (index.html + hashed assets) and served them cache-first. The new
// Vite build ships no service worker, so the old one would keep serving stale
// content to returning visitors. This worker replaces the old one at the same
// URL, wipes its caches and unregisters itself, letting the new site load fresh.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
  )
})
