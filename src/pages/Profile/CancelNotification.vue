<template>
  <li
    class="text-right p-4 rounded-lg bg-blue-200 hover:bg-opacity-80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out"
  >
    <div class="flex flex-col">
      <p class="font-semibold grow">
        {{ notification.custom_fields?.game_name }} has been canceled
      </p>
      <div class="self-end flex space-x-2 items-center mt-1">
        <ClockIcon class="h-4 w-4 text-brand-500" />
        <p class="text-sm text-brand-500">
          {{ formatRelative(new Date(notification.created_at), new Date()) }}
        </p>
      </div>
    </div>
  </li>
</template>
<script setup lang="ts">
import { formatRelative } from "date-fns";
import { Notification } from "@/typings/Notification";
import { PropType } from "vue";
defineProps({
  notification: {
    type: Object as PropType<Notification>,
    required: true,
  },
});
</script>
