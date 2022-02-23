import { reactive } from "vue";
import { store } from "./store";
import { supabase } from "./supabase";
import { log } from "./util/logger";
const applicationServerPublicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY;

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export let swRegistration: ServiceWorkerRegistration;
export const webPushSubscriptionStore = reactive({ isSubscribed: false });

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function (swReg) {
      swRegistration = swReg;
      init();
    })
    .catch(function (error) {
      console.error("Service Worker Error", error);
    });
} else {
  console.warn("Push messaging is not supported");
}

function init() {
  swRegistration.pushManager.getSubscription().then(function (subscription) {
    webPushSubscriptionStore.isSubscribed = !(subscription === null);
  });
}

export function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then(function (subscription) {
      console.log("User is subscribed.");

      storeSubscription(subscription);

      webPushSubscriptionStore.isSubscribed = true;
    })
    .catch(function (err) {
      console.log("Failed to subscribe the user: ", err);
    });
}

export function unsubscribeUser() {
  let subscriptionToRemove: PushSubscription;
  swRegistration.pushManager
    .getSubscription()
    .then(function (subscription) {
      if (subscription) {
        subscriptionToRemove = subscription;
        return subscription.unsubscribe();
      }
    })
    .catch(function (error) {
      console.log("Error unsubscribing", error);
    })
    .then(function () {
      removeSubscription(subscriptionToRemove);

      console.log("User is unsubscribed.");
      webPushSubscriptionStore.isSubscribed = false;
    });
}

async function storeSubscription(subscription?: PushSubscription | null) {
  if (!store.user?.id) {
    throw new Error("no signed in user");
  }

  console.log(subscription);

  if (subscription) {
    const encoded = encodeURIComponent(JSON.stringify(subscription));
    const { error } = await supabase.rpc("store_web_push_subscription", {
      user_id: store.user.id,
      subscription: encoded,
    });
    if (error) {
      log({ error });
    }
  }
}
async function removeSubscription(subscription?: PushSubscription | null) {
  if (!store.user?.id) {
    throw new Error("no signed in user");
  }

  if (subscription) {
    const encoded = encodeURIComponent(JSON.stringify(subscription));
    const { error } = await supabase.rpc("remove_web_push_subscription", {
      user_id: store.user.id,
      subscription: encoded,
    });
    if (error) {
      log({ error });
    }
  }
}
