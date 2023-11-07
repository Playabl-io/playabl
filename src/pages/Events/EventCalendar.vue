<template>
  <div>
    <div class="flex items-center justify-end gap-4">
      <SortMenu v-model="sortOption" :options="options" />
      <div class="items-center relative">
        <Menu>
          <MenuButton
            class="border border-solid border-gray-200 bg-gray-200 bg-opacity-70 hover:bg-opacity-100 transition-all rounded-md h-10 w-10 grid place-content-center"
          >
            <AdjustmentsHorizontalIcon class="h-6 w-6" />
          </MenuButton>
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0"
            enter-to-class="transform opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0"
          >
            <MenuItems
              class="mt-2 absolute -translate-x-3/4 whitespace-nowrap text-sm flex flex-col items-stetch gap-2 bg-gray-50 border border-solid border-gray-200 border-opacity-70 rounded-lg text-slate-900 p-2 z-20 shadow-xl"
            >
              <MenuItem v-slot="{ active }">
                <FormLabel
                  for="exclude-own"
                  class="font-normal p-2 flex items-center gap-2 rounded-md"
                  :class="{
                    'bg-gray-200 bg-opacity-50': active,
                  }"
                  no-margin
                >
                  <input
                    id="exclude-own"
                    v-model="excludeOwnGames"
                    type="checkbox"
                    class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
                  />
                  Hide games I created
                </FormLabel>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <FormLabel
                  for="exclude-active"
                  class="font-normal p-2 flex items-center gap-2 rounded-md"
                  :class="{
                    'bg-gray-200 bg-opacity-50': active,
                  }"
                  no-margin
                >
                  <input
                    id="exclude-active"
                    v-model="excludeRsvpdGames"
                    type="checkbox"
                    class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
                  />
                  Hide games I'm in
                </FormLabel>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
    <TabGroup>
      <TabList class="flex gap-4">
        <Tab v-slot="{ selected }" as="template">
          <button
            class="p-2 rounded-lg focus-styles"
            :class="{
              'bg-brand-500 text-white font-semibold': selected,
              'bg-transparent text-black': !selected,
            }"
          >
            List view
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button
            class="p-2 rounded-lg focus-styles"
            :class="{
              'bg-brand-500 text-white font-semibold': selected,
              'bg-transparent text-black': !selected,
            }"
          >
            Calendar view
          </button>
        </Tab>
      </TabList>
      <TabPanels class="mt-6">
        <TabPanel>
          <ListView
            :loading="loading"
            :sessions="filteredSessions"
            :sessions-by-game="
              sessionsByGame as Record<string, sessionWithGame[]>
            "
            :reference-date="referenceDate"
            @update-reference-date="onDateChange"
            @refresh="refreshSessions"
          />
        </TabPanel>
        <TabPanel>
          <CalendarView
            :sessions="filteredSessions"
            :sessions-by-game="
              sessionsByGame as Record<string, sessionWithGame[]>
            "
            :reference-date="referenceDate"
            :selected-date="selectedDate"
            @update-reference-date="onDateChange"
            @update-selected-date="selectedDate = $event"
            @refresh="refreshSessions"
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { format, parse } from "date-fns";
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/vue";
import { AdjustmentsHorizontalIcon } from "@heroicons/vue/24/outline";
import FormLabel from "@/components/Forms/FormLabel.vue";
import {
  loadOpenEventSessions,
  loadEventSessions,
} from "@/api/gamesAndSessions";
import SortMenu from "@/components/Menus/SortMenu.vue";
import CalendarView from "@/pages/Community/CalendarView.vue";
import ListView from "@/pages/Community/ListView.vue";
import { store } from "@/store";
import * as R from "ramda";
import { eventStore } from "./eventStore";
import { useRoute, useRouter } from "vue-router";
import { sessionWithGame } from "../IndexPage.vue";

const route = useRoute();
const router = useRouter();

const referenceDate = computed(() => {
  if (route.query.date && typeof route.query.date === "string") {
    const date = parse(route.query.date, "yyyy-MM", new Date());
    return date;
  }
  const date = new Date();
  return date;
});

function onDateChange(date: Date) {
  router.push({ query: { date: format(date, "yyyy-MM") } });
}

const options = [
  {
    label: "All sessions",
    value: loadAllEventSessions,
  },
  {
    label: "Has openings",
    value: loadEventSessionsWithOpenings,
  },
];

const loading = ref(false);

const sessions = ref<sessionWithGame[]>([]);
const selectedDate = ref<Date>();
const sortOption = ref(options[0]);

const sessionsByGame = computed(() => {
  const groupByGame = R.groupBy((session: sessionWithGame) =>
    String(session.game_id.id),
  );
  return groupByGame(sessions.value);
});

const excludeOwnGames = ref(false);
const excludeRsvpdGames = ref(false);

const filteredSessions = computed(() => {
  let filteredSessions = sessions.value;
  if (excludeOwnGames.value) {
    filteredSessions = sessions.value.filter(
      (session) => session.creator_id !== store.user?.id,
    );
  }
  if (excludeRsvpdGames.value) {
    filteredSessions = filteredSessions.filter(
      (session) => !session.rsvps.includes(store.user?.id || ""),
    );
  }
  return filteredSessions;
});

onMounted(async () => {
  loading.value = true;
  await sortOption.value.value();
  loading.value = false;
});

watch(
  () => sortOption.value,
  (newVal) => {
    newVal.value();
  },
);

async function refreshSessions() {
  loading.value = true;
  await sortOption.value.value();
  loading.value = false;
}

async function loadAllEventSessions() {
  if (!eventStore.event?.community_id) {
    throw new Error("Event does not have community ID");
  }
  loading.value = true;
  const data = await loadEventSessions({
    eventId: eventStore.event.id,
  });
  sessions.value = data ?? [];
  loading.value = false;
}

async function loadEventSessionsWithOpenings() {
  if (!eventStore.event?.community_id) {
    throw new Error("Event does not have community ID");
  }
  loading.value = true;
  const data = await loadOpenEventSessions({
    eventId: eventStore.event.id,
  });
  sessions.value = data ?? [];
  loading.value = false;
}
</script>
