<template>
  <base-template>
    <GamesHeading />
    <section v-if="!store.user">
      You need to create an account to join games.
      <router-link to="/sign-in"> Sign up for free </router-link>
    </section>
    <template v-else>
      <GamesNav class="mt-12" />
      <GamesListing :is-loading="isLoading" :games="games" />
    </template>
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import GamesListing from "@/components/GamesListing.vue";
import { RsvpWithSessionAndGame } from "@/typings/Game";
import { store } from "@/store";
import { loadJoinedGames } from "@/api/games";
import GamesHeading from "@/components/GamesHeading.vue";
import GamesNav from "@/components/GamesNav.vue";

const isLoading = ref(true);
const games = ref<RsvpWithSessionAndGame[]>([]);

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
