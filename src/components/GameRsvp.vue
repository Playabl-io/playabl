<template>
  <div
    class="rounded-xl border border-solid p-6"
    :class="[isWaitlisted ? 'bg-gray-100' : 'bg-teal-100 border-teal-50']"
  >
    <div class="grid grid-cols-2">
      <div>
        <router-link :to="`/games/${rsvp.session_id.game_id.id}`">
          <Heading as="h3" level="h6" class="mb-1 hover:underline">
            {{ rsvp.session_id.game_id.title }}
          </Heading>
        </router-link>
        <p>
          {{ format(rsvp.session_id.start_time, "EEE, MMM do") }}
        </p>
        <p class="text-sm mb-4">
          {{ format(rsvp.session_id.start_time, "h:mm a") }} —
          {{ format(rsvp.session_id.end_time, "h:mm a") }}
        </p>
        <p class="text-xs font-semibold">
          {{ rsvp.session_id.game_id.communities.name }}
        </p>
      </div>
      <div class="place-self-center">
        <p class="prose dark:prose-invert">
          {{ rsvp.session_id.game_id.description }}
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { format } from "date-fns";
import { RsvpWithSessionAndGame } from "@/typings/Game";
import { computed, PropType, toRefs } from "vue";
import Heading from "./Heading.vue";

const props = defineProps({
  rsvp: {
    type: Object as PropType<RsvpWithSessionAndGame>,
    required: true,
  },
});
toRefs(props);

const isWaitlisted = computed(() => {
  const rsvpIndex = props.rsvp.session_id.rsvps.findIndex(
    (rsvp) => rsvp.id === props.rsvp.id
  );
  return rsvpIndex >= props.rsvp.session_id.game_id.participant_count;
});
</script>
