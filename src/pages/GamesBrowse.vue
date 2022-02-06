<template>
  <base-template>
    <GamesNav class="mb-12" />
    <GamesHeading>
      <template #heading>
        <Heading level="h6" as="h2">From your communities</Heading>
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
import { loadJoinedCommunityIds } from "@/api/communities";
import { loadCommunityGames } from "@/api/games";
import GamesHeading from "@/components/GamesHeading.vue";
import GamesNav from "@/components/GamesNav.vue";

const isLoading = ref(false);
const games = ref<GameListing[]>([]);

onMounted(loadAllGames);

async function loadAllGames() {
  isLoading.value = true;
  const data = await loadJoinedCommunityIds().then((communityIds) => {
    if (Array.isArray(communityIds)) {
      return loadCommunityGames(
        communityIds.map((community) => community.community_id)
      );
    }
  });
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}
</script>
