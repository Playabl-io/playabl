<template>
  <div class="flex justify-between items-end">
    <Heading level="h6" class="mb-2">Upcoming Games</Heading>
    <PrimaryButton
      v-if="isCreatorOrAdmin"
      :to="`/games/new?event_id=${eventStore.event?.id}&community_id=${eventStore.event?.community_id}`"
      >Add Game to Event</PrimaryButton
    >
  </div>
  <div
    class="grid grid-flow-col auto-cols-auto gap-6 overflow-auto items-start"
  >
    <EventGameItem
      v-for="game in eventStore.eventGames"
      :key="game.id"
      :game="game"
    />
  </div>
  <div>
    <div v-if="eventStore.event?.description">
      <Heading level="h6" class="mt-6 mb-2">Details</Heading>
      <Well class="bg-white">
        <TipTapDisplay :content="eventStore.event.description" />
      </Well>
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
import Heading from "@/components/Heading.vue";
import { eventStore } from "./eventStore";
import EventGameItem from "./EventGameItem.vue";
import Well from "@/components/Well.vue";
import TipTapDisplay from "@/components/TipTapDisplay.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import ColorTag from "@/components/ColorTag.vue";
import { UserGroupIcon } from "@heroicons/vue/24/outline";
import { store } from "@/store";
import { ROLES } from "@/util/roles";
import InfoBanner from "@/components/Banners/InfoBanner.vue";

const isCreatorOrAdmin = computed(() => {
  if (!eventStore.event?.community_id) {
    return false;
  }
  const role =
    store.userCommunityMembership[eventStore.event.community_id]
      .communityMembership.role_id;
  return role === ROLES.admin || role === ROLES.creator;
});
</script>
