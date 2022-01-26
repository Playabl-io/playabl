<template>
  <button
    class="bg-transparent hover:scale-110 border-none rounded-full p-1"
    v-bind="$attrs"
    :aria-label="props.label"
  >
    <XCircleIcon class="h-5 w-5" />
  </button>
</template>
<script setup lang="ts">
import { XCircleIcon } from "@heroicons/vue/outline";
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
});
</script>
