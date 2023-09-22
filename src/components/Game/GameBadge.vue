<template>
  <div
    class="px-4 py-2 bg-sky-100 grid badge-grid gap-2 justify-center items-center rounded-lg"
  >
    <slot name="icon"></slot>
    <div class="flex flex-col items-end">
      <p class="font-semibold text-right">{{ value }}</p>
      <p class="text-xs text-slate-600 line-clamp-3">{{ title }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
});
</script>
<style scoped>
.badge-grid {
  grid-template-columns: 24px 1fr;
}
</style>
