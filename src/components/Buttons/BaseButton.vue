<template>
  <button
    class="flex justify-center items-center font-semibold rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-0 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
    :class="{
      'p-4 min-h-10': size === 'default',
      'p-2 h-6': size === 'small',
      'p-0': size === 'bare',
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
