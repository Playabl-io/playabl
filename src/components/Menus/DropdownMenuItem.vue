<template>
  <MenuItem v-slot="{ active }">
    <button
      :class="{ [activeMenuItem]: active }"
      class="px-2 py-1 rounded-md w-full text-left"
      @click="emit('click', $event)"
    >
      <slot></slot>
    </button>
  </MenuItem>
</template>
<script setup lang="ts">
import { MenuItem } from "@headlessui/vue";
const activeMenuItem = "bg-gray-100 cursor-pointer";
const emit = defineEmits(["click"]);
</script>
