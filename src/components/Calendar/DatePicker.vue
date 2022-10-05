<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="w-full p-1 border-b border-solid border-brand-400 flex items-center justify-between focus-styles"
      @click="toggleCalendar"
    >
      {{ format(selected, "EEE, MMM do") }}
      <ChevronDownIcon v-if="!showCalendar" class="h-4 w-4" />
      <ChevronUpIcon v-else class="h-4 w-4" />
    </button>
    <transition
      enter-active-class="transition-all ease-out-quad duration-200"
      leave-active-class="transition-all ease-in-quad duration-300"
      enter-from-class="opacity-0 scale-70"
      leave-to-class="opacity-0 scale-70"
      enter-to-class="opacity-1 scale-100"
      leave-from-class="opacity-1 scale-100"
    >
      <div v-if="showCalendar" ref="calendar" class="absolute z-10 mt-2">
        <CalendarPicker
          size="medium"
          :selected="selected"
          :not-before="notBefore"
          :not-after="notAfter"
          @select="emit('select', $event)"
          @close="handleClose"
        />
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { ref, toRefs } from "vue";
import { onClickOutside } from "@vueuse/core";
import { format } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/20/solid";
import CalendarPicker from "./CalendarPicker.vue";
const emit = defineEmits(["select"]);
const props = defineProps({
  selected: {
    type: Date,
    required: true,
  },
  notBefore: {
    type: Date,
    default: null,
  },
  notAfter: {
    type: Date,
    default: null,
  },
});
toRefs(props);

const calendar = ref<HTMLElement>();
onClickOutside(calendar, (event) => {
  if (event.target === trigger.value) return;
  showCalendar.value = false;
});

const trigger = ref<HTMLButtonElement>();

const showCalendar = ref(false);
function toggleCalendar() {
  showCalendar.value = !showCalendar.value;
}
function focusTrigger() {
  trigger.value?.focus();
}
function handleClose() {
  toggleCalendar();
  focusTrigger();
}
</script>
