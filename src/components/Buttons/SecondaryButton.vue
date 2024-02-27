<template>
  <BaseButton
    v-bind="$attrs"
    :disabled="$attrs.disabled || isLoading"
    class="p-2 rounded-md transition-all"
    :class="colorClasses"
  >
    <loading-spinner v-if="isLoading" color="brand-500" />
    <p v-if="isLoading" class="sr-only">Loading</p>
    <slot v-else></slot>
  </BaseButton>
</template>
<script setup lang="ts">
import { computed } from "vue";
import LoadingSpinner from "../LoadingSpinner.vue";
import BaseButton from "./BaseButton.vue";
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "gray",
  },
});
const colorClasses = computed(() => {
  switch (props.color) {
    case "green":
      return "bg-green-200 hover:bg-green-300 text-green-900";
    case "blue":
      return "bg-blue-100 hover:bg-blue-200 text-blue-700";
    case "gray":
    default:
      return "bg-gray-300 text-slate-900 bg-opacity-60 hover:bg-opacity-90";
  }
});
</script>
