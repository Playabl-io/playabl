<template>
  <button
    v-bind="$attrs"
    class="p-2 rounded-md bg-transparent border border-gray-500 hover:bg-gray-100 focus:bg-gray-100 text-slate-900 flex justify-center"
  >
    <loading-spinner v-if="isLoading" />
    <p v-if="isLoading" class="sr-only">Loading</p>
    <slot v-else></slot>
  </button>
</template>
<script setup lang="ts">
import { toRefs } from "vue";
import LoadingSpinner from "../LoadingSpinner.vue";
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const { isLoading } = toRefs(props);
</script>
