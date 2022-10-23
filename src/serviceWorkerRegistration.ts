export let swRegistration: ServiceWorkerRegistration;

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function (swReg) {
      swRegistration = swReg;
    })
    .catch(function (error) {
      console.error("Service Worker Error", error);
    });
} else {
  console.warn("Push messaging is not supported");
}
