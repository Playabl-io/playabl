self.addEventListener("push", function (event) {
  const title = "Playabl";
  const options = {
    body: event.data.text(),
    icon: "images/icon.png",
    badge: "images/badge.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(clients.openWindow("https://playabl.io"));
});
