<template>
  <ProfileTemplate>
    <section class="flex flex-col">
      <SecondaryButton
        v-if="unreadNotifications.length > 1"
        :is-loading="dismissingAll"
        class="ml-auto"
        @click="dismissAll"
      >
        Dismiss All
      </SecondaryButton>
      <section v-if="unreadNotifications.length">
        <ul class="grid gap-6">
          <component
            :is="notificationComponent(notification.type)"
            v-for="notification in unreadNotifications"
            :key="notification.id"
            :notification="notification"
            @clear="handleClear(notification)"
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
import { ref } from "vue";
import ProfileTemplate from "@/components/ProfileTemplate.vue";
import { unreadNotifications } from "@/util/notifications";
import { Notification } from "@/typings/Notification";
import RsvpNotification from "./RsvpNotification.vue";
import CancelNotification from "./CancelNotification.vue";
import { clearNotification } from "@/api/notifications";
import useToast from "@/components/Toast/useToast";

const dismissingAll = ref(false);
const { showError } = useToast();

function notificationComponent(type: Notification["type"]) {
  switch (type) {
    case "cancel":
      return CancelNotification;
    case "rsvp":
    case "notify_creator_of_rsvp":
      return RsvpNotification;
    default:
      return "div";
  }
}

async function handleClear(notification: Notification) {
  try {
    await clearNotification(notification);
  } catch (error) {
    showError({ message: "Unable to clear notification" });
  }
}

async function dismissAll() {
  dismissingAll.value = true;
  await Promise.allSettled(unreadNotifications.value.map(handleClear));
  dismissingAll.value = false;
}
</script>
