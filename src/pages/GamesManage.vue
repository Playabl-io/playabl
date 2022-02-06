<template>
  <base-template>
    <GamesNav class="mb-12" />
    <GamesHeading>
      <template #heading>
        <Heading level="h6" as="h2">Your upcoming games</Heading>
      </template>
    </GamesHeading>
    <GamesListing :is-loading="isLoading" :games="games" />
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import GamesListing from "@/components/GamesListing.vue";
import { GameListing } from "@/typings/Game";
import Heading from "@/components/Heading.vue";
import { loadManagedGames } from "@/api/games";
import GamesHeading from "@/components/GamesHeading.vue";
import GamesNav from "@/components/GamesNav.vue";
import { store } from "@/store";

const isLoading = ref(false);
const games = ref<GameListing[]>([]);

onMounted(loadAllGames);

async function loadAllGames() {
  if (!store.user) return;
  isLoading.value = true;
  const data = await loadManagedGames(store.user.id);
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}
</script>
