<template>
  <li class="py-4">
    <div v-if="gameStore.attendees[id]" class="flex items-center space-x-4">
      <Avatar
        :username="display"
        :avatar-url="gameStore.attendees[id].avatar_url"
      />
      <div class="flex flex-col">
        <p>
          {{ display }}
        </p>
        <p class="text-sm text-slate-700">
          {{ gameStore.attendees[id].pronouns }}
        </p>
      </div>
    </div>
    <LoadingSpinner v-else color="brand-500" />
  </li>
</template>
<script setup lang="ts">
import { computed } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { gameStore } from "./gameStore";
import Avatar from "@/components/Avatar.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const display = computed(() => {
  return (
    gameStore.attendees[props.id].username ||
    `${gameStore.attendees[props.id].email.slice(0, 5)}....`
  );
});
</script>
