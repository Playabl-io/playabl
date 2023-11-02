<template>
  <div class="grid sm:grid-cols-3 gap-6 h-full items-start">
    <div class="flex flex-col h-full gap-6">
      <PrimaryButton
        v-if="allowCreateNew"
        class="shadow-sm"
        @click="emit('createNew')"
      >
        New {{ title }}
      </PrimaryButton>
      <div class="rounded-md bg-white shadow-sm flex flex-col gap-4 p-4">
        <template v-if="!isSmAndLarger">
          <Disclosure>
            <DisclosureButton class="text-sm font-semibold">
              Open filters and sort
            </DisclosureButton>
            <DisclosurePanel>
              <slot name="page-controls"></slot>
            </DisclosurePanel>
          </Disclosure>
        </template>
        <template v-else>
          <slot name="page-controls"></slot>
        </template>
      </div>
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <button
          v-if="backToTopVisible"
          class="rounded-full shadow-lg w-8 h-8 bg-blue-500 grid place-content-center"
          :class="[
            isSmAndLarger ? 'sticky top-1/2' : 'fixed bottom-2 inset-x-2',
          ]"
          @click="scrollToTop"
        >
          <ArrowUpCircleIcon class="text-white w-8 h-8" />
        </button>
      </transition>
    </div>

    <div class="sm:col-span-2 rounded-md w-full">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { useBreakpoints, breakpointsTailwind, useScroll } from "@vueuse/core";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { ArrowUpCircleIcon } from "@heroicons/vue/24/solid";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

const { y } = useScroll(window);

const backToTopVisible = computed(() => {
  return y.value > 750;
});

function scrollToTop() {
  window.scrollTo(0, 0);
}

defineProps({
  allowCreateNew: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["createNew", "clear"]);
</script>
