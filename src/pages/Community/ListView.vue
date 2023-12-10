<template>
  <section class="relative">
    <div class="flex items-center gap-2 mb-4">
      <GhostButton @click="priorMonth">
        <ChevronLeftIcon class="h-6 w-6" />
      </GhostButton>
      <Heading as="h3" level="h4" class="w-64 text-center">
        {{ format(referenceDate, "MMMM, yyyy") }}
      </Heading>
      <GhostButton @click="nextMonth">
        <ChevronRightIcon class="h-6 w-6" />
      </GhostButton>
    </div>
    <p class="px-2 mt-6 mb-4 text-sm text-slate-700">
      {{ monthSessions.length }} sessions
    </p>
    <div class="flex gap-2">
      <component
        :is="view === 'tile' ? SecondaryButton : GhostButton"
        @click="view = 'tile'"
      >
        <Tooltip>
          <template #trigger="{ toggleTooltip }">
            <Squares2X2Icon
              class="h-5 w-5 text-slate-700"
              @mouseenter="toggleTooltip"
              @mouseleave="toggleTooltip"
              @focus="toggleTooltip"
              @blur="toggleTooltip"
            />
          </template>
          <template #tooltip> Display as cards </template>
        </Tooltip>
      </component>
      <component
        :is="view === 'list' ? SecondaryButton : GhostButton"
        @click="view = 'list'"
      >
        <Tooltip>
          <template #trigger="{ toggleTooltip }">
            <ListBulletIcon
              class="h-5 w-5 text-slate-700"
              @mouseenter="toggleTooltip"
              @mouseleave="toggleTooltip"
              @focus="toggleTooltip"
              @blur="toggleTooltip"
            />
          </template>
          <template #tooltip> Display as list </template>
        </Tooltip>
      </component>
    </div>
    <ul
      class="mt-4 overflow-visible"
      :class="{
        'grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start': view === 'tile',
        grid: view === 'list',
      }"
    >
      <div v-if="loading" class="col-span-full my-3">
        <LoadingSpinner color="brand-500" />
      </div>
      <li
        v-if="view === 'list'"
        class="grid list-grid gap-2 p-2 font-semibold text-xs"
      >
        <p>Created by</p>
        <p>Game title and system</p>
        <p>Time</p>
        <p class="md:justify-self-center">Open seats</p>
      </li>
      <component
        :is="listComponent"
        v-for="session in monthSessions"
        :key="session.id"
        :all-game-sessions="sessionsByGame[String(session.game_id.id)]"
        :session="session"
        @refresh="emit('refresh')"
      />
    </ul>
  </section>
</template>
<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/vue/24/outline";
import Heading from "@/components/Heading.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import MiniGameItem from "./MiniGameItem.vue";
import ListViewItem from "./ListViewItem.vue";
import { sessionWithGame } from "../IndexPage.vue";
import Tooltip from "@/components/Tooltip.vue";

const props = defineProps({
  sessions: {
    type: Object as PropType<sessionWithGame[]>,
    required: true,
  },
  sessionsByGame: {
    type: Object as PropType<Record<string, sessionWithGame[]>>,
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

const view = ref<"tile" | "list">("tile");
const listComponent = computed(() => {
  if (view.value === "tile") {
    return MiniGameItem;
  }
  return ListViewItem;
});

const monthSessions = computed(() => {
  const start = startOfMonth(props.referenceDate).getTime();
  const end = endOfMonth(props.referenceDate).getTime();
  return props.sessions.filter(
    (session) => session.start_time >= start && session.end_time <= end,
  );
});

const emit = defineEmits(["updateReferenceDate", "refresh"]);

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
}
@media screen(md) {
  .list-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) 120px 60px;
  }
}
</style>
