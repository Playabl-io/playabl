<template>
  <BaseTemplate>
    <section>
      <Heading as="h4" level="h4" class="mb-3">Your upcoming games</Heading>
      <div v-if="isLoading" class="grid place-content-center">
        <LoadingSpinner color="brand-500" />
      </div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-if="games.length === 0" class="col-span-full">
          <p class="text-sm">You are not playing in any upcoming games.</p>
        </div>
        <GameCard v-for="game in games" :key="game.id" :game="game" />
      </div>
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { GameListing } from "@/typings/Game";
import { store } from "@/store";
import { loadUpcomingJoinedGames } from "@/api/gamesAndSessions";
import GameCard from "@/components/Game/GameCard.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";

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
