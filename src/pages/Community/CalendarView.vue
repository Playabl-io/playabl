<template>
  <div class="flex flex-col gap-4 justify-center">
    <section
      class="w-full p-4 bg-white rounded-md border border-solid border-gray-200"
    >
      <template v-if="selectedDate">
        <Heading level="h5" as="h5" class="px-4">
          {{ format(selectedDate, "LLLL do") }}
        </Heading>
        <ul
          class="mt-4 overflow-visible grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          <MiniGameItem
            v-for="session in sessionsForDay(selectedDate)"
            :key="session.id"
            :all-game-sessions="sessionsByGame[String(session.game_id.id)]"
            :session="session"
            :user-access="userAccess"
            @refresh="emit('refresh')"
          />
        </ul>
      </template>
      <div v-else class="h-full flex flex-col justify-center items-center">
        <p class="text-lg font-light">Select a date to see events</p>
      </div>
    </section>
    <section class="w-full">
      <DisplayCalendar
        :reference-date="referenceDate"
        :selected-date="selectedDate"
        @update-date="emit('updateReferenceDate', $event)"
        @select-date="emit('updateSelectedDate', $event)"
      >
        <template #day="day">
          <ul class="grow flex flex-wrap justify-end items-end gap-2">
            <li v-for="session in sessionsForDay(day)" :key="session.id">
              <Tooltip>
                <template #trigger="{ toggleTooltip }">
                  <div
                    class="h-3 w-3"
                    :class="[
                      session.has_openings
                        ? 'bg-green-500 rounded-full'
                        : 'bg-red-700 rounded-sm',
                    ]"
                    @mouseenter="toggleTooltip"
                    @mouseleave="toggleTooltip"
                    @focus="toggleTooltip"
                    @blur="toggleTooltip"
                  />
                </template>
                <template #tooltip>
                  {{ session.game_id.title }}
                </template>
              </Tooltip>
            </li>
          </ul>
        </template>
      </DisplayCalendar>
    </section>
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { isSameDay, format } from "date-fns";
import { GameSession } from "@/typings/Session";
import DisplayCalendar from "@/components/Calendar/DisplayCalendar.vue";

import Tooltip from "@/components/Tooltip.vue";
import Heading from "@/components/Heading.vue";
import MiniGameItem from "./MiniGameItem.vue";
import { CommunityAccess } from "@/typings/CommunityAccess";

const props = defineProps({
  sessions: {
    type: Object as PropType<GameSession[]>,
    required: true,
  },
  sessionsByGame: {
    type: Object as PropType<Record<string, GameSession[]>>,
    required: true,
  },
  referenceDate: {
    type: Object as PropType<Date>,
    required: true,
  },
  selectedDate: {
    type: Object as PropType<Date>,
    default: undefined,
  },
  userAccess: {
    type: Array as PropType<CommunityAccess[]>,
    required: true,
  },
});

const emit = defineEmits([
  "updateReferenceDate",
  "updateSelectedDate",
  "refresh",
]);

function sessionsForDay(day: Date) {
  const dateSessions = props.sessions?.filter((session) =>
    isSameDay(day, new Date(session.start_time))
  );
  return dateSessions;
}
</script>
