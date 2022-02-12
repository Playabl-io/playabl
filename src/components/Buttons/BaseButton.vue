<template>
  <button
    class="flex justify-center items-center font-medium rounded-md cursor-pointer focus-styles"
    :class="{
      'p-3 h-10': size === 'default',
      'p-2 h-6': size === 'small',
      'p-0': size === 'bare',
      'cursor-not-allowed opacity-50': $attrs.disabled,
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
});
toRefs(props);
</script>
