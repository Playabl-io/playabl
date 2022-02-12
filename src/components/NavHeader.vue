<template>
  <header
    class="w-screen h-14 pb-2 px-12 prose-sm grid grid-cols-6 sticky top-0 bg-inherit items-end box-border z-10"
    v-bind="$attrs"
  >
    <router-link to="/" class="font-paytone text-lg"> Playout </router-link>
    <nav class="mx-auto col-span-4 flex items-center">
      <router-link
        class="pt-2 mx-6"
        :to="`${store.user ? '/communities/joined' : '/communities/all'}`"
        :class="{
          'border-t border-brand-500 dark:border-brand-300': onCommunitiesRoute,
        }"
      >
        Communities
      </router-link>
      <router-link
        class="pt-2 mx-6"
        to="/games/joined"
        :class="{
          'border-t border-brand-500 dark:border-brand-300': onGamesRoute,
        }"
      >
        Games
      </router-link>
    </nav>
    <div class="flex justify-end">
      <user-menu />
    </div>
  </header>
</template>
<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import UserMenu from "./UserMenu.vue";
import { store } from "../store";

const route = useRoute();

const onCommunitiesRoute = route.path.includes("communities");
const onGamesRoute = route.path.includes("games");
</script>
