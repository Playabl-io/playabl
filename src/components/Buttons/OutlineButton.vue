<template>
  <base-button
    v-bind="$attrs"
    class="bg-transparent border border-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:bg-gray-100 text-slate-900 dark:text-slate-50 transition-all"
  >
    <loading-spinner v-if="isLoading" color="brand-500" />
    <p v-if="isLoading" class="sr-only">Loading</p>
    <slot v-else></slot>
  </base-button>
</template>
<script setup lang="ts">
import { toRefs } from "vue";
import LoadingSpinner from "../LoadingSpinner.vue";
import BaseButton from "./BaseButton.vue";
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const { isLoading } = toRefs(props);
</script>
