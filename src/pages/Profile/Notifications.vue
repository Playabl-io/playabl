<template>
  <ProfileTemplate>
    <section class="flex flex-col">
      <section v-if="unreadNotifications.length">
        <ul class="grid gap-6">
          <component
            :is="notificationComponent(notification.type)"
            v-for="notification in unreadNotifications"
            :key="notification.id"
            :notification="notification"
          />
        </ul>
      </section>
      <p
        v-else
        class="grid place-content-center text-lg text-slate-600 font-light"
      >
        No new notifications
      </p>
      <hr class="my-10" />
      <div class="flex flex-col">
        <FormLabel>Email notifications</FormLabel>
        <p>
          We'll email you each time you are RSVP'd to a game. At this time this
          cannot be disabled.
        </p>
      </div>
      <div class="flex flex-col mt-8">
        <FormLabel>Web notifications</FormLabel>
        <p class="mb-6">
          You can enable web notifications on each device you use to get alerts
          when you are RSVP'd to a game.
        </p>
        <OutlineButton
          v-if="webPushSubscriptionStore.isSubscribed"
          @click="unsubscribeUser"
        >
          <BellIcon class="w-6 h-6 mr-2 text-slate-700" />
          Disable notifications on this device
        </OutlineButton>
        <PrimaryButton v-else @click="subscribeUser">
          <BellIcon class="w-6 h-6 mr-2" />
          Enable notifications on this device
        </PrimaryButton>
      </div>
    </section>
  </ProfileTemplate>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { formatRelative } from "date-fns";
import { ClockIcon, BellIcon } from "@heroicons/vue/outline";
import ProfileTemplate from "@/components/ProfileTemplate.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import {
  subscribeUser,
  unsubscribeUser,
  webPushSubscriptionStore,
} from "@/serviceWorkerRegistration";
import FormLabel from "@/components/Forms/FormLabel.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import { supabase } from "@/supabase";
import { unreadNotifications } from "@/util/notifications";
import { Notification } from "@/typings/Notification";
import RsvpNotification from "./RsvpNotification.vue";
import CancelNotification from "./CancelNotification.vue";

const toBeCleared = ref<Notification[]>([]);
const readTimeout = setTimeout(() => {
  toBeCleared.value = [...unreadNotifications.value];
}, 5000);

async function markNotificationsRead(notifications: Notification[]) {
  if (notifications.length === 0) return;
  const updatedNotifications = notifications.map((notification) => ({
    id: notification.id,
    read: true,
    user_id: notification.user_id,
  }));
  await supabase.from("notifications").upsert(updatedNotifications);
}

onUnmounted(() => {
  clearTimeout(readTimeout);
  markNotificationsRead(toBeCleared.value);
});

function notificationComponent(type: Notification["type"]) {
  switch (type) {
    case "cancel":
      return CancelNotification;
    case "rsvp":
      return RsvpNotification;
    default:
      return "div";
  }
}
</script>
