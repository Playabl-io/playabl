<template>
  <label
    :for="id"
    class="rounded-xl border border-solid border-gray-300 cursor-pointer focus-within:ring-1 focus-within:ring-blue-500 focus-within:ring-offset-2 select-none"
    :class="{
      'border-blue-500 bg-blue-500 text-white': modelValue,
    }"
  >
    <input
      :id="id"
      name="gameType"
      type="checkbox"
      class="w-0 h-0 opacity-0"
      :checked="modelValue"
      @change="handleChange"
    />
    <span class="p-2">
      <slot></slot>
    </span>
  </label>
</template>
<script setup lang="ts">
defineProps({
  modelValue: [Boolean],
  id: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);

function handleChange(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.checked);
}
</script>
