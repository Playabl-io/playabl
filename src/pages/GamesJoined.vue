<template>
  <base-template>
    <GamesNav class="mb-12" />
    <div v-if="isLoading" class="grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <section v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-if="games.length === 0" class="col-span-full">
        <p class="prose">You do not have any upcoming games.</p>
        <router-link
          to="/games/browse"
          class="text-brand-500 font-semibold hover:border-b hover:border-solid hover:border-brand-500"
        >
          You can browse available games here.
        </router-link>
      </div>
      <GameCard v-for="game in games" :key="game.id" :game="game" />
    </section>
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import { GameListing } from "@/typings/Game";
import { store } from "@/store";
import { loadUpcomingJoinedGames } from "@/api/gamesAndSessions";
import GamesNav from "@/components/GamesNav.vue";
import GameCard from "@/components/Game/GameCard.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const isLoading = ref(true);
const games = ref<GameListing[]>([]);

onMounted(loadAllGames);

async function loadAllGames() {
  if (!store.user) return;
  isLoading.value = true;
  const data = await loadUpcomingJoinedGames(store.user.id);
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}
</script>
