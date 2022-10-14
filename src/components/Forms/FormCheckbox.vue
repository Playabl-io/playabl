<template>
  <input
    v-bind="$attrs"
    class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
    :checked="isChecked"
    type="checkbox"
    @change="handleChange"
  />
</template>
<script setup lang="ts">
import { computed, useAttrs } from "vue";

const props = defineProps({
  modelValue: {
    type: [Boolean, Object as () => string[]],
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);
const attrs = useAttrs();
const value = attrs.value as string;

const isChecked = computed(() => {
  if (typeof props.modelValue === "boolean") {
    return props.modelValue;
  }
  return props.modelValue.includes(value);
});

function handleChange(event: Event) {
  const element = event.target as HTMLInputElement;
  if (typeof props.modelValue === "boolean") {
    emit("update:modelValue", element.checked);
  }
  if (Array.isArray(props.modelValue)) {
    const nextValue = isChecked.value
      ? props.modelValue.filter((val) => val !== value)
      : props.modelValue.concat(value);
    emit("update:modelValue", nextValue);
  }
}
</script>
