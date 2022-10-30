<template>
  <section class="relative">
    <div class="flex items-center gap-2 mb-4">
      <GhostButton @click="priorMonth">
        <ChevronLeftIcon class="h-6 w-6" />
      </GhostButton>
      <Heading as="h3" level="h4">
        {{ format(referenceDate, "MMMM, yyyy") }}
      </Heading>
      <GhostButton @click="nextMonth">
        <ChevronRightIcon class="h-6 w-6" />
      </GhostButton>
    </div>
    <ul class="grow flex flex-col gap-3 w-full relative">
      <li class="grid list-grid p-2 font-semibold text-xs">
        <p>Game title and system</p>
        <p>Start time</p>
        <p>End time</p>
        <p class="md:justify-self-center">Open seats</p>
      </li>
      <div v-if="loading" class="mx-auto mt-3">
        <LoadingSpinner color="brand-500" />
      </div>

      <li
        v-for="session in monthSessions"
        :key="session.id"
        class="rounded-md odd:bg-slate-100 w-full"
      >
        <router-link
          :to="`/games/${session.game_id.id}`"
          class="grid list-grid items-center p-2"
        >
          <div class="flex flex-col">
            <p class="text-lg">
              {{ session.game_id.title }}
            </p>
            <p class="text-sm text-slate-700 mt-1">
              {{ session.game_id.system }}
            </p>
          </div>
          <p class="text-sm">
            {{ format(session.start_time, "EEEE, MMM do h:mm aa") }}
          </p>
          <p class="text-sm">
            {{ format(session.end_time, "EEEE, MMM do h:mm aa") }}
          </p>
          <div class="text-sm md:justify-self-center flex items-center gap-1">
            <div
              class="h-3 w-3"
              :class="[
                session.has_openings
                  ? 'bg-green-500 rounded-full'
                  : 'bg-red-700 rounded-sm',
              ]"
            />
          </div>
        </router-link>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { computed, PropType } from "vue";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { GameSession } from "@/typings/Session";
import Heading from "@/components/Heading.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";

const props = defineProps({
  sessions: {
    type: Object as PropType<GameSession[]>,
    required: true,
  },
  referenceDate: {
    type: Object as PropType<Date>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

const monthSessions = computed(() => {
  const start = startOfMonth(props.referenceDate).getTime();
  const end = endOfMonth(props.referenceDate).getTime();
  return props.sessions.filter(
    (session) => session.start_time >= start && session.end_time <= end
  );
});

const emit = defineEmits(["updateReferenceDate"]);

function nextMonth() {
  emit("updateReferenceDate", addMonths(props.referenceDate, 1));
}
function priorMonth() {
  emit("updateReferenceDate", addMonths(props.referenceDate, -1));
}
</script>
<style scoped>
.list-grid {
  grid-template-columns: auto;
  @apply gap-2;
}
@media screen(md) {
  .list-grid {
    grid-template-columns: 31% 27% 27% 12%;
  }
}
</style>
