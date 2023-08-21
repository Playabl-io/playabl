<template>
  <input
    v-bind="$attrs"
    :class="{
      'border-red-500': hasError,
      'border-gray-300': !hasError,
    }"
    class="h-10 p-2 rounded-md border border-gray-300 text-slate-900 dark:bg-slate-200 focus-styles"
    :value="modelValue"
    @input="handleInput"
  />
</template>
<script setup lang="ts">
defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  hasError: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);

function handleInput(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.value);
}
</script>
