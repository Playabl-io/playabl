self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("PLAYABL-STATIC-CACHE").then(function (cache) {
      return cache.addAll([
        "/src/assets/Open_Sans/OpenSans-VariableFont.ttf",
        "/src/assets/Paytone_One/PaytoneOne-Regular.ttf",
        "/favicon.ico",
      ]);
    })
  );
});

// The "network falling back to cache" strategy
// https://web.dev/offline-cookbook/
self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
