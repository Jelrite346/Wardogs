// Minimal service worker for the WARDOGS Mortar Calculator PWA.
// It caches the app shell so the page loads offline. The saved-shots
// data still requires a network connection since it lives in Firebase.

const CACHE_NAME = "wardogs-mortar-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Cache the app shell on install.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Clean up old caches on activation.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first for Firebase/Google requests (must always be live),
// cache-first for the local app shell so it opens instantly/offline.
self.addEventListener("fetch", function (event) {
  const url = event.request.url;

  // Never cache Firebase or Google SDK traffic; always go to the network.
  if (
    url.includes("firebaseio.com") ||
    url.includes("gstatic.com") ||
    url.includes("googleapis.com")
  ) {
    return; // Let the browser handle it normally (network).
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
