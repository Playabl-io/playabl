<template>
  <nav-header v-if="isSmAndLarger" />
  <MobileNavHeader v-else />
  <main class="py-8 px-4 md:container md:mx-auto max-w-6xl grow">
    <slot></slot>
  </main>
</template>
<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";
import NavHeader from "@/components/Navigation/NavHeader.vue";
import MobileNavHeader from "@/components/Navigation/MobileNavHeader.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

const route = useRoute();

useHead({
  title: route.meta.title as string,
});

const VERSION = import.meta.env.VITE_APP_VERSION;
const BUILD_DATE = import.meta.env.VITE_APP_BUILD_EPOCH
  ? new Date(Number(import.meta.env.VITE_APP_BUILD_EPOCH))
  : undefined;
</script>
