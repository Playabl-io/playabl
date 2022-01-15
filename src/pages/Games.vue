<template>
  <base-template>
    <Heading level="h1">Games</Heading>
    <section class="mt-12 flex justify-between items-baseline text-sm">
      <div class="flex space-x-4 py-2">
        <p class="border-b border-brand-500">Joined</p>
        <p>Browse</p>
        <p>Manage scheduled</p>
      </div>
      <router-link to="/communities/new" class="hover:underline">
        Create a new game
      </router-link>
    </section>
  </base-template>
</template>
<script setup lang="ts">
import BaseTemplate from "@/components/BaseTemplate.vue";
import Heading from "@/components/Heading.vue";
</script>
