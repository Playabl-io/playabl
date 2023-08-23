<template>
  <BaseTemplate>
    <BrowsePageTemplate
      title="Game"
      allow-create-new
      @create-new="
        router.push({
          path: '/games/new',
        })
      "
    >
      <template #page-controls>
        <UrlSortDropdown />
        <div class="flex flex-col">
          <FormLabel>System</FormLabel>
          <FilterDropdown
            v-model="system"
            :options="gameSystemList"
            placeholder="Select or enter system"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col">
            <FormLabel>Min Players</FormLabel>
            <FormInput v-model="min" type="number" />
          </div>
          <div class="flex flex-col">
            <FormLabel>Max Players</FormLabel>
            <FormInput v-model="max" type="number" />
          </div>
        </div>
        <div class="flex flex-col">
          <FormLabel no-margin>Filter</FormLabel>
          <div class="flex items-center gap-2 mt-2 mb-3">
            <FormCheckbox id="open" v-model="filter" value="open" />
            <FormLabel for="open" no-margin>Has Openings</FormLabel>
          </div>
          <div class="flex items-center gap-2 mb-3">
            <FormCheckbox id="recorded" v-model="filter" value="recorded" />
            <FormLabel for="recorded" no-margin>Is Recorded</FormLabel>
          </div>
          <div class="flex items-center gap-2">
            <FormCheckbox
              id="safety-tools"
              v-model="filter"
              value="safety-tools"
            />
            <FormLabel for="safety-tools" no-margin
              >Uses Safety Tools</FormLabel
            >
          </div>
        </div>
      </template>
      <template #content>
        <GamesListing :is-loading="isLoading" :games="games" />
      </template>
    </BrowsePageTemplate>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import BrowsePageTemplate from "@/layouts/BrowsePageTemplate.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import GamesListing from "@/components/GamesListing.vue";
import { GameListing } from "@/typings/Game";
import { loadBrowsableGames } from "@/api/gamesAndSessions";
import { useRouter, useRoute } from "vue-router";
import { useRouteQuery } from "@vueuse/router";
import UrlSortDropdown from "@/components/Search/UrlSortDropdown.vue";
import {
  SORT_DIR,
  SORT_DIR_PATH,
  SORT_KEY,
  SORT_KEY_PATH,
} from "@/util/urlParams";
import FormInput from "@/components/Forms/FormInput.vue";
import gameSystemList from "@/util/gameSystemList";
import FilterDropdown from "@/components/Dropdown/FilterDropdown.vue";

const route = useRoute();
const router = useRouter();
const ensureArray = (val: any) => {
  if (Array.isArray(val)) {
    return val;
  }
  return [val];
};
const filter = useRouteQuery("filter", [] as string[], {
  transform: ensureArray,
});
const min = useRouteQuery("min-players", undefined);
const max = useRouteQuery("max-players", undefined);
const system = useRouteQuery("system", "");

const isLoading = ref(true);
const games = ref<GameListing[]>([]);

onMounted(async () => {
  loadGames();
});

async function loadGames() {
  isLoading.value = true;
  games.value = [];
  const openOnly = filter.value.includes("open");
  const isRecorded = filter.value.includes("recorded");
  const usesSafetyTools = filter.value.includes("safety-tools");
  const data = await loadBrowsableGames({
    sortKey: route.query[SORT_KEY_PATH] as SORT_KEY,
    sortDir: route.query[SORT_DIR_PATH] as SORT_DIR,
    openOnly,
    isRecorded,
    usesSafetyTools,
    minPlayer: min.value,
    maxPlayer: max.value,
    system: system.value,
  });
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}

watch([route], () => {
  loadGames();
});
</script>
