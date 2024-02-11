<template>
  <base-button
    class="bg-inherit hover:bg-gray-200 dark:hover:bg-gray-700 text-current dark:text-slate-100 transition-all"
    v-bind="$attrs"
    :disabled="$attrs.disabled || isLoading"
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
