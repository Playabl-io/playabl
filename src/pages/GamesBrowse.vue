<template>
  <base-template>
    <GamesNav class="mb-12" />
    <div class="flex justify-end">
      <SortMenu v-model="sortOption" :options="options" />
    </div>
    <GamesListing :is-loading="isLoading" :games="games" />
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import GamesListing from "@/components/GamesListing.vue";
import { GameListing } from "@/typings/Game";
import {
  loadChronologicalGames,
  loadGamesWithOpenings,
} from "@/api/gamesAndSessions";
import GamesNav from "@/components/GamesNav.vue";
import SortMenu from "@/components/Menus/SortMenu.vue";

const options = [
  { label: "Starting soon", value: loadAllGames },
  {
    label: "Has openings",
    value: loadOpenGames,
  },
];

const isLoading = ref(true);
const games = ref<GameListing[]>([]);
const sortOption = ref(options[0]);

watch(
  () => sortOption.value,
  (newVal) => newVal.value()
);

onMounted(async () => {
  loadAllGames();
});

async function loadAllGames() {
  isLoading.value = true;
  games.value = [];
  const data = await loadChronologicalGames();
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}

async function loadOpenGames() {
  isLoading.value = true;
  games.value = [];
  const data = await loadGamesWithOpenings();
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}
</script>
