const CACHE_VERSION = "hargahantu-v1";
const STATIC_CACHE = CACHE_VERSION + "-static";
const DYNAMIC_CACHE = CACHE_VERSION + "-dynamic";

const STATIC_ASSETS = ["/", "/search", "/offline.html", "/manifest.webmanifest"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return (
              key.startsWith("hargahantu-") &&
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE
            );
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;

  // Skip API and Supabase requests
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("supabase.co")
  )
    return;

  // For navigation requests, use network-first with offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          var clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match("/offline.html");
          });
        })
    );
    return;
  }

  // For other requests, use cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request)
        .then(function (response) {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          )
            return response;
          var clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function () {
          return new Response("", { status: 408 });
        });
    })
  );
});
