<template>
  <nav-header v-if="true" />
  <MobileNavHeader v-else />
  <main class="p-12 md:container md:mx-auto max-w-4xl flex-1">
    <slot></slot>
  </main>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";
import NavHeader from "./NavHeader.vue";
import MobileNavHeader from "./MobileNavHeader.vue";

const route = useRoute();

useHead({
  title: route.meta.title as string,
  meta: [
    {
      property: "og:title",
      content: route.meta.title,
    },
    {
      name: "twitter:title",
      content: route.meta.title,
    },
  ],
});

const VERSION = import.meta.env.VITE_APP_VERSION;
const BUILD_DATE = import.meta.env.VITE_APP_BUILD_EPOCH
  ? new Date(Number(import.meta.env.VITE_APP_BUILD_EPOCH))
  : undefined;
</script>
