<template>
  <div class="flex items-baseline justify-between">
    <slot name="heading">
      <Heading level="h1">Games</Heading>
    </slot>
  </div>
</template>
<script setup lang="ts">
import Heading from "./Heading.vue";
</script>
