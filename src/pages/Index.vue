<template>
  <section class="h-full bg-brand-500 flex flex-col text-brand-100">
    <nav-header class="bg-brand-500" />
    <main class="grid place-items-center flex-1">
      <span class="flex flex-col items-center space-y-4">
        <heading level="h1">Playout</heading>
        <p class="prose prose-x text-current">Play great games</p>
      </span>
    </main>
  </section>
</template>
<script setup lang="ts">
import Heading from "@/components/Heading.vue";
import NavHeader from "@/components/NavHeader.vue";
</script>
