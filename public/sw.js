/* Minimal service worker: network-first for pages, cache-first for static assets.
   Enough for "Add to Home Screen" + instant reopen. No push handling yet. */
const VERSION = "cfo-v1";
const STATIC = /\/_next\/static\/|\/icons\/|\/manifest\.webmanifest$|\.(?:png|svg|woff2?)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (STATIC.test(url.pathname)) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && request.mode === "navigate") {
          caches.open(VERSION).then((cache) => cache.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match("/home")))
  );
});
