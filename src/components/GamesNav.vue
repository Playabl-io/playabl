<template>
  <section class="flex space-x-5 py-2 items-baseline text-sm">
    <router-link
      v-if="store.user"
      to="/games/joined"
      active-class="border-b border-brand-500 dark:border-brand-300"
    >
      Joined
    </router-link>
    <router-link
      to="/games/browse"
      active-class="border-b border-brand-500 dark:border-brand-300"
    >
      Browse
    </router-link>
    <router-link
      v-if="store.user"
      to="/games/manage"
      active-class="border-b border-brand-500 dark:border-brand-300"
    >
      Manage
    </router-link>
    <router-link to="/games/new"> Create a new game </router-link>
  </section>
</template>
<script setup lang="ts">
import { store } from "@/store";
</script>
