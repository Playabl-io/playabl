import { computed } from "vue";
import { store } from "@/store";

export const unreadNotifications = computed(() =>
  store.notifications.filter((notification) => !notification.read)
);
