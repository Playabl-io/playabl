<template>
  <ProfileTemplate>
    <section class="flex flex-col">
      <section v-if="unreadNotifications.length">
        <ul class="grid gap-6">
          <div
            v-for="notification in unreadNotifications"
            :key="notification.id"
          >
            <a v-if="notification.related_url" :href="notification.related_url">
              <li
                class="text-right p-4 rounded-lg bg-blue-200 hover:bg-opacity-80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <div class="flex flex-col">
                  <p class="font-semibold grow">
                    {{ notification.message }}
                  </p>
                  <div class="self-end flex space-x-2 items-center mt-1">
                    <ClockIcon class="h-4 w-4 text-brand-500" />
                    <p class="text-sm text-brand-500">
                      {{
                        formatRelative(
                          new Date(notification.created_at),
                          new Date()
                        )
                      }}
                    </p>
                  </div>
                </div>
              </li>
            </a>
          </div>
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
import { store } from "@/store";
import { supabase } from "@/supabase";
import { unreadNotifications } from "@/util/notifications";
import { Notification } from "@/typings/Notification";

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
</script>
