<template>
  <div
    class="p-2 rounded-md text-center whitespace-nowrap"
    :class="{
      'bg-violet-100': variant === 'purple',
      'bg-blue-200': variant === 'blue',
      'bg-emerald-200': variant === 'green',
      'bg-gray-200': variant === 'gray',
      'bg-white': variant === 'white',
    }"
    v-bind="$attrs"
  >
    <p
      class="text-sm font-semibold"
      :class="{
        'text-brand-500': variant === 'purple',
        'text-blue-900': variant === 'blue',
        'text-emerald-900': variant === 'green',
        'text-slate-700': variant === 'white' || variant === 'gray',
      }"
    >
      <slot></slot>
    </p>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from "vue";

defineProps({
  variant: {
    type: String as PropType<"white" | "blue" | "green" | "purple" | "gray">,
    default: "white",
  },
});
</script>
