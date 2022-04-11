<template>
  <BaseButton
    v-bind="$attrs"
    class="p-2 rounded-md bg-gray-200 dark:bg-slate-600 text-black dark:text-slate-100"
  >
    <loading-spinner v-if="isLoading" color="brand-500" />
    <p v-if="isLoading" class="sr-only">Loading</p>
    <slot v-else></slot>
  </BaseButton>
</template>
<script setup lang="ts">
import LoadingSpinner from "../LoadingSpinner.vue";
import BaseButton from "./BaseButton.vue";
defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>
