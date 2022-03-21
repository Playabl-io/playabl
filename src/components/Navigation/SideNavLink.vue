<template>
  <router-link
    :to="to"
    class="flex gap-4 p-2 rounded-md"
    active-class="bg-purple-100 text-brand-500"
  >
    <slot></slot>
  </router-link>
</template>
<script setup lang="ts">
defineProps({
  to: {
    type: String,
    required: true,
  },
});
</script>
