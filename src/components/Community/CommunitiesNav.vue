<template>
  <section class="flex justify-between items-baseline text-sm">
    <div class="flex flex-wrap gap-4 py-2">
      <router-link
        v-if="store.user"
        to="/communities/joined"
        active-class="border-b border-brand-500 dark:border-brand-300"
      >
        Joined
      </router-link>
      <router-link
        to="/communities/browse"
        active-class="border-b border-brand-500 dark:border-brand-300"
      >
        Browse
      </router-link>
      <router-link
        v-if="store.user"
        to="/communities/manage"
        active-class="border-b border-brand-500 dark:border-brand-300"
      >
        Manage
      </router-link>
      <router-link to="/communities/new"> New </router-link>
    </div>
  </section>
</template>
<script setup lang="ts">
import { store } from "@/store";
</script>
