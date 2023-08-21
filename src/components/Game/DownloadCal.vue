<template>
  <a
    download
    :href="`data:text/calendar;charset=utf8,${event}`"
    class="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:shadow-sm focus-styles text-sm font-medium"
  >
    <CalendarIcon class="w-6 h-6" />
    Download iCalendar
  </a>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { format } from "date-fns";
import { CalendarIcon } from "@heroicons/vue/24/outline";
import { gameStore } from "@/pages/Game/gameStore";
import * as ics from "ics";

const props = defineProps({
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
});

const event = computed(() => {
  const { value } = ics.createEvent({
    start: format(props.startTime, "yyyy-M-d-H-m")
      .split("-")
      .map((val) => parseInt(val)) as [number, number, number, number, number],
    end: format(props.endTime, "yyyy-M-d-H-m")
      .split("-")
      .map((val) => parseInt(val)) as [number, number, number, number, number],
    title: gameStore.game.title,
    description: `Game details: https://app.playabl.io/games/${gameStore.game.id}`,
  });
  return encodeURIComponent(value || "");
});
</script>
