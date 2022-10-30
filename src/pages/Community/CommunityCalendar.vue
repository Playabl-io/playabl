<template>
  <div>
    <div class="flex justify-end">
      <SortMenu v-model="sortOption" :options="options" class="w-40" />
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
            :sessions="sessions"
            :reference-date="referenceDate"
            :selected-date="selectedDate"
            @update-reference-date="referenceDate = $event"
            @update-selected-date="selectedDate = $event"
          />
        </TabPanel>
        <TabPanel>
          <ListView
            :loading="loading"
            :sessions="sessions"
            :reference-date="referenceDate"
            @update-reference-date="referenceDate = $event"
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import { GameSession } from "@/typings/Session";
import {
  // loadCommunitySessionsForMonth,
  loadOpenCommunitySessions,
  loadAllCommunitySessions,
} from "@/api/gamesAndSessions";
import { communityStore } from "./communityStore";
import SortMenu from "@/components/Menus/SortMenu.vue";
import CalendarView from "./CalendarView.vue";
import ListView from "./ListView.vue";

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

onMounted(async () => {
  loading.value = true;
  await loadCommunitySessions(referenceDate.value);
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
</script>
