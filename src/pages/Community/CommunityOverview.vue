<template>
  <div class="flex flex-wrap gap-4">
    <div
      class="w-40 h-40 bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Members</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ communityStore.membersCount }}
      </p>
    </div>
    <div
      class="w-40 h-40 bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Upcoming Games</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ communityStore.gamesCount }}
      </p>
    </div>
  </div>
  <div class="section-container">
    <InviteLinks />
  </div>
</template>
<script setup lang="ts">
import { communityStore } from "./communityStore";
import InviteLinks from "./InviteLinks.vue";
</script>
<style scoped>
.section-container {
  @apply border border-solid border-gray-300 p-4 rounded-lg;
}
</style>
