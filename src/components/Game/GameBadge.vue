<template>
  <div class="p-4 bg-sky-100 flex justify-center items-center rounded-lg">
    <slot name="icon"></slot>
    <div class="flex flex-col items-end">
      <p class="font-semibold">{{ value }}</p>
      <p class="text-xs text-slate-600">{{ title }}</p>
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
