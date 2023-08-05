<template>
  <a
    :href="`http://www.google.com/calendar/render?
action=TEMPLATE
&dates=${formattedStartTime}/${formattedEndTime}
&details=Game details: https://app.playabl.io/games/${gameStore.game.id}
&location=https://app.playabl.io/games/${gameStore.game.id}
&text=${encodedTitle}
`"
    target="_blank"
    rel="noreferrer noopener"
    class="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:shadow-sm focus-styles text-sm font-medium"
  >
    <img :src="GoogleIcon" class="w-6" />
    Add to Google Calendar
  </a>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { format } from "date-fns";
import GoogleIcon from "@/assets/svg/Google.svg";
import { gameStore } from "@/pages/Game/gameStore";

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

const formattedStartTime = computed(() => {
  const dateString = format(props.startTime, "yyyyMMdd");
  const timeString = format(props.startTime, "HHmmssX");
  return `${dateString}T${timeString}`;
});
const formattedEndTime = computed(() => {
  const dateString = format(props.endTime, "yyyyMMdd");
  const timeString = format(props.endTime, "HHmmssX");
  return `${dateString}T${timeString}`;
});

const encodedTitle = encodeURIComponent(gameStore.game.title);
</script>
