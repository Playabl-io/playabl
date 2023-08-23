<template>
  <RouterLink
    class="flex gap-4 p-2 rounded-md w-full text-sm font-semibold hover:bg-gray-100 hover:cursor-pointer"
    active-class="bg-purple-100 text-brand-500"
    :to="to"
  >
    <slot></slot>
  </RouterLink>
</template>
<script setup lang="ts">
defineProps({
  to: {
    type: String,
    required: true,
  },
});
</script>
