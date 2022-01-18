<template>
  <input
    v-bind="$attrs"
    class="my-1 p-2 rounded-md border border-gray-300 text-slate-900 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
    :value="modelValue"
    @input="handleInput"
  />
</template>
<script setup lang="ts">
defineProps({
  modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

function handleInput(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.value);
}
</script>
