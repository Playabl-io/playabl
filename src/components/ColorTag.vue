<template>
  <div
    class="p-2 rounded-md"
    :class="{
      'bg-violet-200': variant === 'purple',
      'bg-sky-200': variant === 'blue',
      'bg-emerald-200': variant === 'green',
      'bg-white': variant === 'white',
    }"
    v-bind="$attrs"
  >
    <p
      class="text-sm font-semibold"
      :class="{
        'text-violet-900': variant === 'purple',
        'text-sky-900': variant === 'blue',
        'text-emerald-900': variant === 'green',
        'text-slate-700': variant === 'white',
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
    type: String as PropType<"white" | "blue" | "green" | "purple">,
    default: "white",
  },
});
</script>
