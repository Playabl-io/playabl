<template>
  <base-template>
    <GamesNav class="mb-12" />
    <div class="flex justify-end">
      <div class="w-40">
        <SortMenu
          :options="options"
          :starting-option="{ label: 'Starting soon' }"
        />
      </div>
    </div>
    <GamesListing :is-loading="isLoading" :games="games" />
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import GamesListing from "@/components/GamesListing.vue";
import { GameListing } from "@/typings/Game";
import { loadJoinedCommunityIds } from "@/api/communities";
import {
  loadChronologicalCommunityGames,
  loadCommunityGamesWithOpenings,
} from "@/api/gamesAndSessions";
import GamesNav from "@/components/GamesNav.vue";
import SortMenu from "@/components/Menus/SortMenu.vue";

const isLoading = ref(false);
const games = ref<GameListing[]>([]);
const communityIds = ref<string[]>([]);

onMounted(async () => {
  await loadCommunityIds();
  loadAllGames();
});

async function loadCommunityIds() {
  const data = await loadJoinedCommunityIds();
  if (data) {
    communityIds.value = data.map((community) => community.community_id);
  }
}

async function loadAllGames() {
  isLoading.value = true;
  const data = await loadChronologicalCommunityGames(communityIds.value);
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}

async function loadOpenGames() {
  isLoading.value = true;
  const data = await loadCommunityGamesWithOpenings(communityIds.value);
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}

const options = [
  { label: "Starting soon", onSelect: loadAllGames },
  {
    label: "Has openings",
    onSelect: loadOpenGames,
  },
];
</script>
