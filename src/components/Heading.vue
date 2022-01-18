<template>
  <component
    :is="as || level"
    class="font-paytone"
    :class="fontSizeClass"
    v-bind="$attrs"
  >
    <slot></slot>
  </component>
</template>
<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps({
  level: {
    type: String,
    required: true,
  },
  as: {
    type: String,
    default: "",
  },
});

toRefs(props);

function getFontSizeClass(value: string) {
  switch (value) {
    case "h1":
      return "text-4xl md:text-6xl";
    case "h2":
      return "text-3xl md:text-5xl";
    case "h3":
      return "text-2xl md:text-4xl";
    case "h4":
      return "text-xl md:text-3xl";
    case "h5":
      return "text-lg md:text-2xl";
    case "h6":
      return "text-md md:text-xl";
    default:
      return "text-xl";
  }
}

const fontSizeClass = getFontSizeClass(props.level);
</script>
