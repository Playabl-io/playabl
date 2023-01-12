<template>
  <header
    class="w-screen py-2 px-12 grid grid-cols-6 sticky top-0 bg-inherit items-center box-border z-10"
    v-bind="$attrs"
  >
    <router-link to="/" class="font-paytone text-lg"> Playabl </router-link>
    <nav class="mx-auto col-span-4 flex items-center">
      <router-link
        class="pt-2 mx-6 border-t"
        :to="`${store.user ? '/communities/joined' : '/communities/browse'}`"
        :class="{
          'border-brand-500 dark:border-brand-300': onCommunitiesRoute,
          'border-transparent': !onCommunitiesRoute,
        }"
      >
        Communities
      </router-link>
      <router-link
        class="pt-2 mx-6 border-t"
        :to="`${store.user ? '/games/joined' : '/games/browse'}`"
        :class="{
          'border-brand-500 dark:border-brand-300': onGamesRoute,
          'border-transparent': !onGamesRoute,
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
import UserMenu from "../UserMenu.vue";
import { store } from "../../store";

const route = useRoute();

// remove first /
const path = route.path.substring(1);
const [directory] = path.split("/");

const onCommunitiesRoute = directory === "communities";
const onGamesRoute = directory === "games";
</script>
