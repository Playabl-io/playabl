<template>
  <section class="grid grid-cols-1 gap-8 mt-12">
    <span v-if="isLoading" class="place-self-center">
      <LoadingSpinner color="brand-500" />
    </span>
    <template v-else v-for="game in games" :key="game.id">
      <GameListingVue :id="game.id" :game="game" />
      <hr class="last:hidden border-slate-200" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { PropType, toRefs } from "vue";
import { GameListing } from "@/typings/Game";
import LoadingSpinner from "./LoadingSpinner.vue";
import GameListingVue from "./GameListing.vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  games: {
    type: Array as PropType<GameListing[]>,
    required: true,
  },
});
toRefs(props);
</script>
