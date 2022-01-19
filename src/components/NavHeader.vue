<template>
  <header
    class="px-12 pt-8 pb-4 prose-sm grid grid-cols-6 content-center sticky top-0 bg-inherit"
    v-bind="$attrs"
  >
    <router-link to="/" class="font-paytone text-lg">Playout</router-link>
    <nav class="mx-auto col-span-4 place-items-center">
      <router-link
        class="pt-2 mx-6"
        :to="`${store.user ? '/communities/joined' : '/communities/all'}`"
        active-class="border-t border-brand-500 dark:border-brand-300"
        :class="{
          'border-t border-brand-500 dark:border-brand-300': onCommunitiesRoute,
        }"
      >
        Communities
      </router-link>
      <router-link
        class="pt-2 mx-6"
        to="/games"
        active-class="border-t border-brand-500 dark:border-brand-300"
        :class="{
          'border-t border-brand-500 dark:border-brand-300': onGamesRoute,
        }"
      >
        Games
      </router-link>
    </nav>
    <div class="place-self-end flex items-center">
      <form-input class="mr-4" />
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
