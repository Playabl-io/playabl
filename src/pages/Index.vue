<template>
  <section
    class="h-full bg-gradient-to-b from-violet-500 to-violet-700 flex flex-col text-white"
  >
    <nav-header class="bg-transparent" />
    <main class="grid place-items-center flex-1">
      <span class="flex flex-col items-center space-y-4">
        <h1
          class="font-paytone bg-gradient-to-b from-white to-gray-200 text-transparent text-6xl md:text-9xl drop-shadow-2xl bg-clip-text py-8"
        >
          Playabl
        </h1>
        <p class="text-lg text-white mt-2 text-center">
          10,000 games
          <br />
          Endless playability
        </p>
      </span>
    </main>
  </section>
</template>
<script setup lang="ts">
import NavHeader from "@/components/NavHeader.vue";
</script>
