<template>
  <select
    class="h-10 rounded-md border border-solid border-gray-300 text-slate-900 sm:text-sm dark:bg-slate-200 focus-styles"
    v-bind="$attrs"
    @change="handleChange"
  >
    <slot></slot>
  </select>
</template>
<script setup lang="ts">
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: "",
  },
});
const emit = defineEmits(["update:modelValue"]);
function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit("update:modelValue", target.value);
}
</script>
