<template>
  <PopoverMenu>
    <template #title="{ open: internalOpen }">
      <slot name="title" :open="internalOpen"></slot>
    </template>
    <template #items>
      <slot name="items"></slot>
    </template>
  </PopoverMenu>
</template>
<script setup lang="ts">
import PopoverMenu from "./PopoverMenu.vue";
</script>
