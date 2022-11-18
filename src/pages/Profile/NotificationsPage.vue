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
    </section>
  </ProfileTemplate>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import ProfileTemplate from "@/components/ProfileTemplate.vue";
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
