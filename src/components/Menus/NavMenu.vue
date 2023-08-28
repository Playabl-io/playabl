<template>
  <PopoverMenu>
    <template #title>
      <slot name="title"></slot>
    </template>
    <template #items="{ close }">
      <slot name="items" :close="close"></slot>
    </template>
  </PopoverMenu>
</template>
<script setup lang="ts">
import PopoverMenu from "./PopoverMenu.vue";
</script>
