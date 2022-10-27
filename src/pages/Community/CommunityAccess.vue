<template>
  <section class="section-container">
    <PublicAccess />
  </section>
  <section class="section-container">
    <AccessLevels />
  </section>
</template>
<script setup lang="ts">
import AccessLevels from "./AccessLevels.vue";
import PublicAccess from "./PublicAccess.vue";
</script>
<style scoped>
.section-container {
  @apply border border-solid border-gray-300 p-4 rounded-lg;
}
</style>
