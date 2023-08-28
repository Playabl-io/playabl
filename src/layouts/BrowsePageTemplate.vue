<template>
  <div class="grid sm:grid-cols-3 gap-6 h-full">
    <div>
      <div class="flex flex-col gap-6 sticky top-24">
        <PrimaryButton
          v-if="allowCreateNew"
          class="shadow-sm"
          @click="emit('createNew')"
        >
          New {{ title }}
        </PrimaryButton>
        <div class="rounded-md bg-white shadow-sm flex flex-col gap-6 p-4">
          <template v-if="!isSmAndLarger">
            <Disclosure>
              <DisclosureButton> Open for controls </DisclosureButton>
              <DisclosurePanel>
                <slot name="page-controls"></slot>
              </DisclosurePanel>
            </Disclosure>
          </template>
          <template v-else>
            <slot name="page-controls"></slot>
          </template>
        </div>
      </div>
    </div>
    <div class="sm:col-span-2 rounded-md w-full">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

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

const emit = defineEmits(["createNew"]);
</script>
<style scoped>
.controls {
  max-height: 80%;
}
.controls {
  max-height: 80%;
}
</style>
