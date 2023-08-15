<template>
  <nav-header v-if="isSmAndLarger" />
  <MobileNavHeader v-else />
  <transition
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <InfoBanner
      v-if="route.query.unauthorized"
      class="my-4 max-w-4xl mx-auto"
      @dismiss="router.replace(route.path)"
    >
      You are not authorized to view that page
    </InfoBanner>
  </transition>
  <main class="py-8 px-4 md:container md:mx-auto max-w-6xl grow">
    <slot></slot>
  </main>
</template>
<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import { useHead } from "@vueuse/head";
import NavHeader from "@/components/Navigation/NavHeader.vue";
import MobileNavHeader from "@/components/Navigation/MobileNavHeader.vue";
import InfoBanner from "@/components/Banners/InfoBanner.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

const route = useRoute();
const router = useRouter();

useHead({
  title: route.meta.title as string,
});

const VERSION = import.meta.env.VITE_APP_VERSION;
const BUILD_DATE = import.meta.env.VITE_APP_BUILD_EPOCH
  ? new Date(Number(import.meta.env.VITE_APP_BUILD_EPOCH))
  : undefined;
</script>
