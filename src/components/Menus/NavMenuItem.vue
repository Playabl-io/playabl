<template>
  <MenuItem v-slot="{ active }">
    <RouterLink
      :class="{ [activeMenuItem]: active }"
      class="flex gap-4 p-2 rounded-md w-full"
      active-class="bg-purple-100 text-brand-500"
      :to="to"
    >
      <slot></slot>
    </RouterLink>
  </MenuItem>
</template>
<script setup lang="ts">
import { MenuItem } from "@headlessui/vue";
const activeMenuItem = "bg-gray-100 cursor-pointer";

defineProps({
  to: {
    type: String,
    required: true,
  },
});
</script>
