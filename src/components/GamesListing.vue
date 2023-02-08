<template>
  <section class="grid gap-8 mt-12">
    <span v-if="isLoading" class="place-self-center">
      <LoadingSpinner color="brand-500" />
    </span>
    <template v-for="game in games" v-else-if="games.length" :key="game.id">
      <GameListingVue :id="game.id" :game="game" :user-access="userAccess" />
      <hr class="last:hidden border-slate-200" />
    </template>
    <template v-else>
      <p>Sorry, no results</p>
    </template>
  </section>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { GameListing } from "@/typings/Game";
import LoadingSpinner from "./LoadingSpinner.vue";
import GameListingVue from "./GameListing.vue";
import { CommunityAccess } from "@/typings/CommunityAccess";

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  games: {
    type: Array as PropType<GameListing[]>,
    required: true,
  },
  userAccess: {
    type: Array as PropType<CommunityAccess[]>,
    default: () => [],
  },
});
</script>
