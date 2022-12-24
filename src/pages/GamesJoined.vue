<template>
  <base-template>
    <GamesNav class="mb-12" />
    <div v-if="isLoading" class="grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <section v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-if="games.length === 0"
        class="col-span-full flex flex-col items-start"
      >
        <p class="prose mb-3">You are not playing in any upcoming games.</p>
        <router-link
          to="/games/manage"
          class="text-brand-500 font-semibold mb-1 border-b border-transparent hover:border-solid hover:border-brand-500"
        >
          Manage games you posted.
        </router-link>
        <router-link
          to="/games/browse"
          class="text-brand-500 font-semibold border-b border-transparent hover:border-solid hover:border-brand-500"
        >
          Browse upcoming games.
        </router-link>
      </div>
      <GameCard v-for="game in games" :key="game.id" :game="game" />
    </section>
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
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
