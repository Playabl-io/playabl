<template>
  <header
    class="px-12 py-8 prose-sm grid grid-cols-6 content-center sticky top-0 backdrop-blur-md"
  >
    <router-link to="/" class="font-paytone text-lg">Playout</router-link>
    <nav class="mx-auto col-span-4 place-items-center">
      <router-link
        class="pt-2 mx-6"
        to="/communities"
        active-class="border-t border-brand-500"
      >
        Communities
      </router-link>
      <router-link
        class="pt-2 mx-6"
        to="/games"
        active-class="border-t border-brand-500"
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
import { RouterLink } from "vue-router";
import FormInput from "./Forms/FormInput.vue";
import UserMenu from "./UserMenu.vue";
</script>
