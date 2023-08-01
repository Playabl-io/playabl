<template>
  <DropdownMenu>
    <template #title>
      <slot name="title"></slot>
    </template>
    <template #items>
      <slot name="items"></slot>
    </template>
  </DropdownMenu>
</template>
<script setup lang="ts">
import DropdownMenu from "./DropdownMenu.vue";
</script>
