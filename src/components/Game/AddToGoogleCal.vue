<template>
  <a
    :href="`http://www.google.com/calendar/render?
action=TEMPLATE
&text=${gameStore.game.title}
&dates=${formattedStartTime}/${formattedEndTime}
&details=Game details: https://playabl.io/games/${gameStore.game.id}
&location=https://playabl.io/games/${gameStore.game.id}`"
    target="_blank"
    rel="nofollow"
    class="flex items-center gap-2 p-2 bg-white rounded-md hover:shadow-md focus-styles text-sm font-medium"
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
  const timeString = format(props.startTime, "kkmmX");
  return `${dateString}T${timeString}`;
});
const formattedEndTime = computed(() => {
  const dateString = format(props.endTime, "yyyyMMdd");
  const timeString = format(props.endTime, "kkmmX");
  return `${dateString}T${timeString}`;
});
</script>
