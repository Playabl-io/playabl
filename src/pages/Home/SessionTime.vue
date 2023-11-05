<template>
  <div>
    <p class="font-paytone mb-1 text-xl">
      Session
      {{ session.game_id.sessions.findIndex((s) => s.id === session.id) + 1 }}
      of {{ session.game_id.sessions.length }}
    </p>
    <p class="text-sm">
      {{ format(new Date(session.start_time), "EEE, MMM do") }}
    </p>
    <p class="text-sm">
      {{ format(new Date(session.start_time), "h:mm a") }} -
      {{ format(new Date(session.end_time), "h:mm a") }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from "vue";
import format from "date-fns/format";
import { sessionWithGame } from "../IndexPage.vue";

defineProps({
  session: {
    type: Object as PropType<sessionWithGame>,
    required: true,
  },
});
</script>
