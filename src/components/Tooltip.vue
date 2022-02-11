<template>
  <div class="relative flex flex-col items-center">
    <slot name="trigger" v-bind="{ toggleTooltip }"></slot>
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-70 opacity-0 translate-y-2"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-out"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <p
        v-if="showTooltip"
        class="absolute z-10 bg-neutral-50 bottom-8 text-sm p-3 rounded-md shadow-md border border-solid border-gray-100 w-max"
      >
        <slot name="tooltip"></slot>
      </p>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const showTooltip = ref(false);

function toggleTooltip() {
  showTooltip.value = !showTooltip.value;
}
</script>
