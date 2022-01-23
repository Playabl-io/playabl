<template>
  <header
    class="w-screen px-12 py-2 prose-sm grid grid-cols-6 sticky top-0 bg-inherit"
    v-bind="$attrs"
  >
    <router-link to="/" class="font-paytone text-lg self-center"
      >Playout</router-link
    >
    <nav class="mx-auto col-span-4 flex items-center">
      <router-link
        class="pt-2 mx-6 border-t border-transparent"
        :to="`${store.user ? '/communities/joined' : '/communities/all'}`"
        :class="{
          'border-t border-brand-500 dark:border-brand-300': onCommunitiesRoute,
        }"
      >
        Communities
      </router-link>
      <router-link
        class="pt-2 mx-6 border-t border-transparent"
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
import FormInput from "./Forms/FormInput.vue";
import UserMenu from "./UserMenu.vue";
import { store } from "../store";

const route = useRoute();

const onCommunitiesRoute = route.path.includes("communities");
const onGamesRoute = route.path.includes("games");
</script>
