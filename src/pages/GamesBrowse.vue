<template>
  <base-template>
    <GamesNav class="mb-12" />
    <div class="flex justify-end">
      <div class="w-40">
        <SortMenu v-model="sortOption" :options="options" />
      </div>
    </div>
    <GamesListing :is-loading="isLoading" :games="games" />
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import GamesListing from "@/components/GamesListing.vue";
import { GameListing } from "@/typings/Game";
import { loadJoinedCommunityIds } from "@/api/communities";
import {
  loadChronologicalCommunityGames,
  loadChronologicalGames,
  loadCommunityGamesWithOpenings,
  loadGamesWithOpenings,
} from "@/api/gamesAndSessions";
import GamesNav from "@/components/GamesNav.vue";
import SortMenu from "@/components/Menus/SortMenu.vue";
import { store } from "@/store";

const options = [
  { label: "Starting soon", value: loadAllGames },
  {
    label: "Has openings",
    value: loadOpenGames,
  },
];

const isLoading = ref(true);
const games = ref<GameListing[]>([]);
const communityIds = ref<string[]>([]);
const sortOption = ref(options[0]);

watch(
  () => sortOption.value,
  (newVal) => newVal.value()
);

onMounted(async () => {
  await loadCommunityIds();
  loadAllGames();
});

async function loadCommunityIds() {
  if (!store.user?.id) return;
  const data = await loadJoinedCommunityIds(store.user.id);
  if (data) {
    communityIds.value = data.map((community) => community.community_id);
  }
}

async function loadAllGames() {
  isLoading.value = true;
  const data = await loadChronologicalGames();
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}

async function loadOpenGames() {
  isLoading.value = true;
  const data = await loadGamesWithOpenings();
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}
</script>
