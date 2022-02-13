<template>
  <base-template>
    <GamesNav />
    <GamesListing :is-loading="isLoading" :games="games" />
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import { GameListing, RsvpWithSessionAndGame } from "@/typings/Game";
import { store } from "@/store";
import { loadJoinedGames } from "@/api/games";
import GamesHeading from "@/components/GamesHeading.vue";
import GamesNav from "@/components/GamesNav.vue";
import GamesListing from "@/components/GamesListing.vue";

const isLoading = ref(true);
const games = ref<GameListing[]>([]);

onMounted(loadAllGames);

async function loadAllGames() {
  if (!store.user) return;
  isLoading.value = true;
  const data = await loadJoinedGames(store.user.id);
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}
</script>
