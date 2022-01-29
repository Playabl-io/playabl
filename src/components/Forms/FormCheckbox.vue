<template>
  <input
    v-bind="$attrs"
    class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
    :checked="modelValue"
    type="checkbox"
    @change="handleChange"
  />
</template>
<script setup lang="ts">
defineProps({
  modelValue: [Boolean],
});
const emit = defineEmits(["update:modelValue"]);

function handleChange(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.checked);
}
</script>
