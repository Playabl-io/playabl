<template>
  <button
    class="text-sm"
    :class="{
      'border-b border-brand-500 dark:border-brand-300': selected,
      'opacity-50 cursor-not-allowed': disabled,
    }"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>
<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps({
  selected: {
    type: Boolean,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
toRefs(props);
</script>
