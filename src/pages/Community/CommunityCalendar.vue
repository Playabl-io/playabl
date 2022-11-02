<template>
  <div>
    <div class="flex items-center justify-end gap-4">
      <SortMenu v-model="sortOption" :options="options" class="w-40" />
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
              class="absolute -translate-x-3/4 whitespace-nowrap text-sm flex flex-col items-stetch gap-2 bg-gray-50 border border-solid border-gray-200 border-opacity-70 rounded-lg text-slate-900 p-2 z-20 shadow-xl"
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
            Calendar view
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
            List view
          </button>
        </Tab>
      </TabList>
      <TabPanels class="mt-6">
        <TabPanel>
          <CalendarView
            :user-access="userAccess"
            :sessions="filteredSessions"
            :sessions-by-game="sessionsByGame"
            :reference-date="referenceDate"
            :selected-date="selectedDate"
            @update-reference-date="referenceDate = $event"
            @update-selected-date="selectedDate = $event"
            @refresh="refreshSessions"
          />
        </TabPanel>
        <TabPanel>
          <ListView
            :user-access="userAccess"
            :loading="loading"
            :sessions="filteredSessions"
            :sessions-by-game="sessionsByGame"
            :reference-date="referenceDate"
            @update-reference-date="referenceDate = $event"
            @refresh="refreshSessions"
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
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
import { GameSession } from "@/typings/Session";
import {
  loadOpenCommunitySessions,
  loadAllCommunitySessions,
} from "@/api/gamesAndSessions";
import { communityStore } from "./communityStore";
import SortMenu from "@/components/Menus/SortMenu.vue";
import CalendarView from "./CalendarView.vue";
import ListView from "./ListView.vue";
import { store } from "@/store";
import { loadUserCommunityAccess } from "@/api/communityAccess";
import { CommunityAccess } from "@/typings/CommunityAccess";
import * as R from "ramda";

const options = [
  {
    label: "All sessions",
    value: loadCommunitySessions,
  },
  {
    label: "Has openings",
    value: loadOpenSessionBasedOnDate,
  },
];

const loading = ref(false);

const sessions = ref<GameSession[]>([]);
const referenceDate = ref<Date>(startOfMonth(new Date()));
const selectedDate = ref<Date>();
const sortOption = ref(options[0]);
const userAccess = ref<CommunityAccess[]>([]);

const sessionsByGame = computed(() => {
  const groupByGame = R.groupBy((session: GameSession) =>
    String(session.game_id.id)
  );
  return groupByGame(sessions.value);
});

const excludeOwnGames = ref(false);
const excludeRsvpdGames = ref(false);

const filteredSessions = computed(() => {
  let filteredSessions = sessions.value;
  if (excludeOwnGames.value) {
    filteredSessions = sessions.value.filter(
      (session) => session.creator_id !== store.user?.id
    );
  }
  if (excludeRsvpdGames.value) {
    filteredSessions = filteredSessions.filter(
      (session) => !session.rsvps.includes(store.user?.id || "")
    );
  }
  return filteredSessions;
});

onMounted(async () => {
  loading.value = true;

  await Promise.all([
    sortOption.value.value(referenceDate.value),
    getUserAccess(),
  ]);
  loading.value = false;
});

watch(
  () => referenceDate.value,
  (newVal) => {
    sortOption.value.value(newVal);
  }
);
watch(
  () => sortOption.value,
  (newVal) => {
    newVal.value(referenceDate.value);
  }
);

async function refreshSessions() {
  loading.value = true;
  await sortOption.value.value(referenceDate.value);
  loading.value = false;
}

async function loadCommunitySessions(date: Date) {
  loading.value = true;
  const data = await loadAllCommunitySessions({
    communityId: communityStore.community.id,
    startDate: startOfMonth(addMonths(date, -1)),
    endDate: endOfMonth(addMonths(date, 1)),
  });
  sessions.value = data ?? [];
  loading.value = false;
}

async function loadOpenSessionBasedOnDate(date: Date) {
  loading.value = true;
  const data = await loadOpenCommunitySessions({
    communityId: communityStore.community.id,
    startDate: startOfMonth(addMonths(date, -1)),
    endDate: endOfMonth(addMonths(date, 1)),
  });
  sessions.value = data ?? [];
  loading.value = false;
}

async function getUserAccess() {
  if (!store.user) return;
  const data = await loadUserCommunityAccess({
    userId: store.user?.id,
    communityId: communityStore.community.id,
  });
  console.log("access", data);
  if (data) {
    userAccess.value = data;
  }
}
</script>
