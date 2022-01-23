<script setup lang="ts"></script>
<template>
  <BaseButton
    v-bind="$attrs"
    class="p-2 rounded-md bg-slate-200 dark:bg-slate-600 text-black dark:text-slate-100"
  >
    <loading-spinner v-if="isLoading" />
    <p v-if="isLoading" class="sr-only">Loading</p>
    <slot></slot>
  </BaseButton>
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
