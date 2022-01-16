<template>
  <base-button v-bind="$attrs" class="bg-brand-500 text-white">
    <loading-spinner v-if="isLoading" />
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
