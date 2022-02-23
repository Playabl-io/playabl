self.addEventListener("push", function (event) {
  const title = "Playabl";
  const options = {
    body: event.data.text(),
    icon: "images/icon.png",
    badge: "/playabl_192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(clients.openWindow("https://playabl.io"));
});

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
  console.log(event);
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
