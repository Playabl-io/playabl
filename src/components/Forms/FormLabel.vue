<template>
  <label
    class="text-sm font-semibold text-slate-800"
    :class="{ 'mb-2': !noMargin }"
    v-bind="$attrs"
  >
    <span class="flex items-center gap-1">
      <slot></slot>
      <span
        v-if="required"
        role="presentation"
        class="text-red-700 dark:text-red-400 self-start"
      >
        *
      </span>
    </span>
    <p v-if="helperText" class="text-xs text-slate-700 mt-1 font-normal">
      {{ helperText }}
    </p>
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
  helperText: {
    type: String,
    default: "",
  },
});
toRefs(props);
</script>
