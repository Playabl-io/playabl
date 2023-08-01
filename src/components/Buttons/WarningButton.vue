<template>
  <base-button
    :disabled="isLoading || disabled"
    v-bind="$attrs"
    :class="{
      'bg-red-600 text-white': variant === 'solid',
      'text-red-600 border border-solid border-red-600': variant === 'outline',
      'opacity-50 cursor-not-allowed': disabled,
    }"
  >
    <loading-spinner v-if="isLoading" color="white" />
    <p v-if="isLoading" class="sr-only">Loading</p>
    <slot v-else></slot>
  </base-button>
</template>
<script setup lang="ts">
import { PropType, toRefs } from "vue";
import LoadingSpinner from "../LoadingSpinner.vue";
import BaseButton from "./BaseButton.vue";
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String as PropType<"solid" | "outline">,
    default: () => "solid",
  },
});

const { isLoading } = toRefs(props);
</script>
