<template>
  <textarea
    v-bind="$attrs"
    class="p-2 rounded-md border border-gray-300 text-slate-900 resize-y dark:bg-slate-200 focus-styles"
    :value="modelValue"
    @input="handleInput"
  />
</template>
<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:modelValue"]);

function handleInput(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.value);
}
</script>
