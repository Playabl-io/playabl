<template>
  <DropdownMenu>
    <template #title="{ open }">
      <slot name="title" :open="open"></slot>
    </template>
    <template #items>
      <slot name="items"></slot>
    </template>
  </DropdownMenu>
</template>
<script setup lang="ts">
import DropdownMenu from "./DropdownMenu.vue";
</script>
