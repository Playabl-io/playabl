<template>
  <div class="flex items-baseline justify-between">
    <Heading level="h1">Games</Heading>
    <router-link to="/games/new" class="hover:underline">
      Create a new game
    </router-link>
  </div>
  <section class="mt-12 flex justify-between items-baseline text-sm">
    <div class="flex space-x-4 py-2">
      <router-link
        v-if="store.user"
        to="/games/joined"
        activeClass="border-b border-brand-500 dark:border-brand-300"
      >
        Joined
      </router-link>
      <router-link
        to="/games/browse"
        activeClass="border-b border-brand-500 dark:border-brand-300"
      >
        Browse
      </router-link>
      <router-link
        v-if="store.user"
        to="/games/manage"
        activeClass="border-b border-brand-500 dark:border-brand-300"
      >
        Manage
      </router-link>
    </div>
  </section>
  <section class="grid grid-cols-1 gap-8 mt-12">
    <span v-if="isLoading" class="place-self-center">
      <LoadingSpinner color="brand-500" />
    </span>
    <template v-else v-for="game in games" :key="game.id">
      <Listing
        :id="game.id"
        :name="game.title"
        :description="game.description"
      />
      <hr class="last:hidden border-slate-200" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { PropType, toRefs } from "vue";
import { store } from "@/store";
import { Game } from "@/typings/Game";
import Heading from "./Heading.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import Listing from "./Listing.vue";
const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  games: {
    type: Array as PropType<Game[]>,
    required: true,
  },
});
toRefs(props);
</script>
