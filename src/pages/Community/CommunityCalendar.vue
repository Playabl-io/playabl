<template>
  <div class="flex flex-col lg:flex-row gap-4 justify-center">
    <section
      class="w-full lg:w-80 p-4 bg-white rounded-md border border-solid border-gray-200"
    >
      <template v-if="selectedDate">
        <Heading level="h5" as="h5">
          {{ format(selectedDate, "LLLL do") }}
        </Heading>
        <ul class="grow flex flex-col gap-4 mt-6 overflow-auto">
          <li v-for="session in sessionsForDay(selectedDate)" :key="session.id">
            <router-link
              :to="`/games/${session.game_id.id}`"
              class="grid grid-flow-col gap-6"
            >
              <span>
                <p>{{ session.game_id.title }}</p>
                <p class="text-sm text-slate-700">
                  {{ format(new Date(session.start_time), "LLL do, h:mm a z") }}
                </p>
              </span>
              <CheckCircleIcon
                v-if="session.has_openings"
                class="h-6 w-6 text-blue-700 place-self-center"
              />
              <MinusCircleIcon
                v-else
                class="h-6 w-6 text-slate-700 place-self-center"
              />
            </router-link>
          </li>
        </ul>
      </template>
      <div v-else class="h-full flex flex-col justify-center items-center">
        <p class="text-lg font-light">Select a date to see events</p>
      </div>
    </section>
    <section class="w-full lg:max-w-xl">
      <DisplayCalendar
        :selected-date="selectedDate"
        @update-date="referenceDate = $event"
        @select-date="selectedDate = $event"
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
import { onMounted, ref, watch } from "vue";
import { isSameDay, format } from "date-fns";
import { CheckCircleIcon, MinusCircleIcon } from "@heroicons/vue/outline";
import { Session } from "@/typings/Session";
import DisplayCalendar from "@/components/Calendar/DisplayCalendar.vue";
import { loadCommunitySessionsForMonth } from "@/api/gamesAndSessions";
import { communityStore } from "./communityStore";
import Tooltip from "@/components/Tooltip.vue";
import Heading from "@/components/Heading.vue";

interface GameSession extends Session {
  game_id: {
    title: string;
    id: number;
  };
}

const sessions = ref<GameSession[]>();
const referenceDate = ref<Date>(new Date());
const selectedDate = ref<Date>();

onMounted(() => loadSessionBasedOnDate(referenceDate.value));

watch(() => referenceDate.value, loadSessionBasedOnDate);

async function loadSessionBasedOnDate(date: Date) {
  const data = await loadCommunitySessionsForMonth({
    communityId: communityStore.community.id,
    referenceDate: date,
  });
  if (data) {
    sessions.value = data;
  }
}

function sessionsForDay(day: Date) {
  return sessions.value?.filter((session) =>
    isSameDay(day, new Date(session.start_time))
  );
}
</script>
