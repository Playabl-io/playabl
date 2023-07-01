<template>
  <base-template>
    <GamesNav class="mb-12" />
    <div class="flex justify-end">
      <SortMenu v-model="sortOption" :options="options" />
    </div>
    <GamesListing
      :is-loading="isLoading"
      :games="games"
      :user-access="userAccess"
    />
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import GamesListing from "@/components/GamesListing.vue";
import { GameListing } from "@/typings/Game";
import { loadJoinedCommunityIds } from "@/api/communities";
import {
  loadChronologicalGames,
  loadGamesWithOpenings,
} from "@/api/gamesAndSessions";
import GamesNav from "@/components/GamesNav.vue";
import SortMenu from "@/components/Menus/SortMenu.vue";
import { store } from "@/store";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { loadAllUserAccess } from "@/api/communityAccess";

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
const userAccess = ref<CommunityAccess[]>([]);

watch(
  () => sortOption.value,
  (newVal) => newVal.value()
);

onMounted(async () => {
  await loadCommunityIds();
  loadAllGames();
  getUserAccess();
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

async function getUserAccess() {
  if (!store.user) return;
  const data = await loadAllUserAccess({ userId: store.user.id });
  if (data) {
    userAccess.value = data;
  }
}
</script>
