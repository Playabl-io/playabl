<template>
  <base-template>
    <GamesNav class="mb-12" />
    <div v-if="isLoading" class="grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <template v-else>
      <GamesHeading>
        <template #heading>
          <Heading level="h6" as="h2" class="mb-6">Your upcoming games</Heading>
        </template>
      </GamesHeading>
      <section class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <GameCard v-for="game in games" :key="game.id" :game="game" />
      </section>
      <hr class="my-20" />
      <GamesHeading>
        <template #heading>
          <Heading level="h6" as="h2" class="mb-6">Your past games</Heading>
        </template>
      </GamesHeading>
      <section class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <GameCard v-for="game in pastGames" :key="game.id" :game="game" />
      </section>
    </template>
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { GameListing } from "@/typings/Game";
import GameCard from "@/components/Game/GameCard.vue";
import Heading from "@/components/Heading.vue";
import { loadManagedGames, loadPastManagedGames } from "@/api/gamesAndSessions";
import GamesHeading from "@/components/GamesHeading.vue";
import GamesNav from "@/components/GamesNav.vue";
import { store } from "@/store";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const isLoading = ref(true);
const games = ref<GameListing[]>([]);
const pastGames = ref<GameListing[]>([]);

onMounted(async () => {
  await Promise.all([loadUpcomingGames(), loadPastGames()]);
  isLoading.value = false;
});

async function loadUpcomingGames() {
  if (!store.user) return;
  const data = await loadManagedGames(store.user.id);
  if (data) {
    games.value = data;
  }
}
async function loadPastGames() {
  if (!store.user) return;
  const data = await loadPastManagedGames(store.user.id);
  if (data) {
    pastGames.value = data;
  }
}
</script>
