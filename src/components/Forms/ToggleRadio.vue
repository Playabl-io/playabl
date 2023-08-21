<template>
  <label
    :for="id"
    class="relative rounded-xl border border-solid border-gray-300 cursor-pointer focus-styles focus-styles-within select-none"
    :class="{
      'border-blue-500 bg-blue-500 text-white': modelValue === $attrs.value,
    }"
  >
    <input
      :id="id"
      type="radio"
      class="w-0 h-0 opacity-0 absolute"
      :checked="modelValue === $attrs.value"
      v-bind="$attrs"
      :name="name"
      @change="handleChange"
    />
    <span class="py-1 px-2 grid place-content-center">
      <slot></slot>
    </span>
  </label>
</template>
<script setup lang="ts">
defineProps({
  modelValue: {
    type: [String, Boolean],
    default: "",
  },
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);

function handleChange(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.value);
}
</script>
