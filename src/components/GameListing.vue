<template>
  <article class="grid grid-cols-5">
    <section class="col-span-3 flex flex-col">
      <router-link :to="`/games/${game.id}`" class="hover:underline">
        <heading level="h6">{{ game.title }}</heading>
      </router-link>
      <router-link
        class="mt-1 hover:underline active:underline text-slate-600 dark:text-slate-400 text-sm"
        :to="`/communities/${game.community_id.id}`"
      >
        {{ game.community_id.name }}
      </router-link>
      <p class="prose dark:prose-invert my-6 whitespace-pre-wrap">
        {{ game.description }}
      </p>
      <div class="flex items-center space-x-4">
        <p
          v-for="session in game.sessions"
          :key="session.id"
          class="text-sm font-semibold p-2 border border-solid border-gray-300 bg-gray-100 rounded-md"
        >
          {{ format(new Date(session.start_time), "LLL do") }}
        </p>
      </div>
    </section>
    <section class="col-span-2 grid place-items-end content-center">
      <div class="bg-gray-200 rounded-md aspect-1 h-40"></div>
    </section>
  </article>
</template>
<script setup lang="ts">
import { format } from "date-fns";
import Heading from "./Heading.vue";
import { toRefs, PropType } from "vue";
import { GameListing } from "@/typings/Game";

const props = defineProps({
  game: {
    type: Object as PropType<GameListing>,
    required: true,
  },
});

toRefs(props);
</script>
