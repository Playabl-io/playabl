<template>
  <button
    class="flex justify-center items-center font-mediumcursor-pointer focus-styles"
    :class="{
      'p-3 h-10': size === 'default',
      'p-2 h-6': size === 'small',
      'p-0': size === 'bare',
      'cursor-not-allowed opacity-50': $attrs.disabled,
      'rounded-full': round,
      'rounded-md': !round,
    }"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>
<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "default",
  },
  round: {
    type: Boolean,
    default: false,
  },
});
toRefs(props);
</script>
