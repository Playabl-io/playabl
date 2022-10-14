<template>
  <component :is="as" class="relative h-full flex flex-col" v-bind="$attrs">
    <slot></slot>
  </component>
</template>
<script setup lang="ts">
defineProps({
  as: {
    type: String,
    default: "div",
  },
});
</script>
