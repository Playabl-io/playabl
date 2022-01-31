<template>
  <div>
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 bg-black opacity-20 z-20"
        aria-hidden="true"
      />
    </transition>
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-full"
      v-on:after-enter="activate()"
      v-on:before-leave="deactivate()"
    >
      <div
        v-if="open"
        class="h-screen w-screen sm:[width:460px] absolute inset-y-0 right-0 z-20 bg-neutral-50 shadow-md"
        ref="target"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";

const emit = defineEmits(["close"]);

const target = ref<HTMLElement>();
onClickOutside(target, () => emit("close"));
const { activate, deactivate } = useFocusTrap(target);

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
});
toRefs(props);
</script>
