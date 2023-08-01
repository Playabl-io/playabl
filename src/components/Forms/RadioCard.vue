<template>
  <label
    :for="id"
    class="relative p-4 rounded-md border border-solid transition-all duration-150 ease-out"
    :class="[
      {
        'bg-white border-gray-300': modelValue !== $attrs.value,
        'bg-blue-50 border-blue-500 shadow-md': modelValue === $attrs.value,
        'opacity-80': modelValue === $attrs.value && $attrs.disabled,
        'cursor-not-allowed bg-gray-100': $attrs.disabled,
        'cursor-pointer': !$attrs.disabled,
      },
    ]"
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
    <slot></slot>
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
