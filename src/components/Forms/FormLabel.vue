<template>
  <label
    class="text-sm font-semibold text-slate-800"
    :class="{ 'mb-2': !noMargin }"
    v-bind="$attrs"
  >
    <slot></slot>
    <span
      v-if="required"
      role="presentation"
      class="text-red-700 dark:text-red-400"
    >
      *
    </span>
  </label>
</template>
<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  noMargin: {
    type: Boolean,
    default: false,
  },
});
toRefs(props);
</script>
