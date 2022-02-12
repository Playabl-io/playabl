<template>
  <section class="grid grid-cols-1 gap-8 mt-12">
    <span v-if="isLoading" class="place-self-center">
      <LoadingSpinner color="brand-500" />
    </span>
    <template v-for="rsvp in rsvps" v-else-if="rsvps.length" :key="rsvp.id">
      <GameRsvp :rsvp="rsvp" />
      <hr class="last:hidden border-slate-200" />
    </template>
    <div v-else>You don't have any upcoming sessions</div>
  </section>
</template>
<script setup lang="ts">
import { computed, PropType, toRefs } from "vue";
import { RsvpWithSessionAndGame } from "@/typings/Game";
import LoadingSpinner from "./LoadingSpinner.vue";
import GameRsvp from "./GameRsvp.vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  rsvps: {
    type: Array as PropType<RsvpWithSessionAndGame[]>,
    required: true,
  },
});
toRefs(props);

// const filteredRsvps = computed(() =>
//   props.rsvps.filter((rsvp) => Boolean(rsvp.session_id))
// );
</script>
