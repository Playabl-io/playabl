<template>
  <teleport to="body">
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
      @after-enter="activate()"
      @before-leave="deactivate()"
    >
      <div
        v-if="open"
        ref="target"
        class="h-screen w-screen sm:[width:460px] fixed inset-y-0 right-0 z-20 bg-neutral-50 shadow-md"
      >
        <slot></slot>
      </div>
    </transition>
  </teleport>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";

const emit = defineEmits(["close"]);

const target = ref<HTMLElement>();
onClickOutside(target, () => emit("close"));
const { activate, deactivate } = useFocusTrap(target);

defineProps({
  open: {
    type: Boolean,
    required: true,
  },
});
</script>
