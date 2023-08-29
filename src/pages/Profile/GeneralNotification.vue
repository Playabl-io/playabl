<template>
  <li class="p-4">
    <div class="flex flex-col">
      <div class="flex flex-wrap justify-between">
        <span class="flex items-center gap-2">
          <InformationCircleIcon class="w-6 h-6 text-sky-600" />
          <p class="font-semibold grow prose">
            {{ notification.message }}
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
    <div class="flex justify-end gap-2 mt-3">
      <LinkButton v-if="relative" :to="relative"> View </LinkButton>
      <p>|</p>
      <LinkButton @click="emit('clear')">Dismiss</LinkButton>
    </div>
  </li>
</template>
<script setup lang="ts">
import { PropType, computed } from "vue";
import { formatRelative } from "date-fns";
import { InformationCircleIcon } from "@heroicons/vue/24/solid";
import { ClockIcon } from "@heroicons/vue/24/outline";
import { Notification } from "@/typings/Notification";
import LinkButton from "@/components/Buttons/LinkButton.vue";
const props = defineProps({
  notification: {
    type: Object as PropType<Notification>,
    required: true,
  },
});
const emit = defineEmits(["clear"]);
const relative = computed(() => {
  const url = new URL(props.notification.related_url ?? "");
  return url?.pathname;
});
</script>
