<template>
  <div class="grid sm:grid-cols-3 gap-6">
    <div
      class="bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Games</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ eventStore.eventGames?.length }}
      </p>
    </div>
    <div
      class="bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Sessions</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ counts.sessionCount }}
      </p>
    </div>
    <div
      class="bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>RSVPs</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ counts.rsvpCount }}
      </p>
    </div>
  </div>
  <div class="mt-6 p-4 bg-white rounded-md shadow-sm">
    <div class="text-sm whitespace-pre font-mono">
      {{ JSON.stringify(eventStore.event, null, 2) }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { eventStore } from "./eventStore";

const counts = computed(() => {
  if (!eventStore.eventGames) {
    return {
      sessionCount: 0,
      rsvpCount: 0,
    };
  }
  const allRsvps: string[] = [];
  const sessionCount = eventStore.eventGames.reduce((acc, cur) => {
    cur.sessions.forEach((session) => {
      allRsvps.push(...session.rsvps);
    });
    return acc + cur.sessions.length;
  }, 0);
  const uniq = new Set([...allRsvps]);

  return { sessionCount, rsvpCount: uniq.size };
});
</script>
