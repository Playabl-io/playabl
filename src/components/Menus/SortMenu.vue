<template>
  <Listbox :model-value="modelValue" @update:model-value="emitValueUpdate">
    <div class="relative w-full">
      <ListboxButton
        class="relative h-10 w-full py-2 pl-3 pr-10 text-left bg-gray-200 bg-opacity-70 hover:bg-opacity-100 text-slate-900 rounded-xl cursor-default focus-styles"
      >
        {{ modelValue.label }}
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
        >
          <ChevronUpDownIcon
            class="w-5 h-5 text-slate-700"
            aria-hidden="true"
          />
        </span>
      </ListboxButton>
      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-10 w-full mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="option in options"
            v-slot="{ active, selected }"
            :key="option.label"
            :value="option"
            as="template"
          >
            <li
              :class="[
                active ? 'text-brand-500 bg-violet-50' : 'text-gray-900',
                'cursor-default select-none relative py-2 px-3',
              ]"
            >
              <span
                :class="[
                  selected ? 'font-medium' : 'font-normal',
                  'block truncate',
                ]"
              >
                {{ option.label }}
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import { ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { PropType } from "vue";

type Option = {
  label: string;
  value: unknown;
};

defineProps({
  modelValue: {
    type: Object as PropType<Option>,
    required: true,
  },
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

function emitValueUpdate(value: Option) {
  emit("update:modelValue", value);
}
</script>
