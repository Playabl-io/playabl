<template>
  <li class="p-4">
    <div class="flex flex-col">
      <div class="flex justify-between">
        <span class="flex gap-2 items-center">
          <ExclamationCircleIcon class="h-6 w-6 text-red-500" />
          <p class="font-semibold grow">
            {{ notification.custom_fields?.game_name }} has been cancelled
          </p>
        </span>
        <div class="flex space-x-2 items-center mt-1">
          <ClockIcon class="h-5 w-5 text-slate-700" />
          <p class="text-slate-700">
            {{ formatRelative(new Date(notification.created_at), new Date()) }}
          </p>
        </div>
      </div>
    </div>
    <div class="flex gap-2 mt-3 justify-end">
      <LinkButton @click="emit('clear')">Dismiss</LinkButton>
    </div>
  </li>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { formatRelative } from "date-fns";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";
import { ClockIcon } from "@heroicons/vue/24/outline";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import { Notification } from "@/typings/Notification";
defineProps({
  notification: {
    type: Object as PropType<Notification>,
    required: true,
  },
});
const emit = defineEmits(["clear"]);
</script>
