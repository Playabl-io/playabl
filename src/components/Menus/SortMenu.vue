<template>
  <Listbox v-model="localValue">
    <div class="relative w-full">
      <ListboxButton
        class="relative h-10 w-full py-2 pl-3 pr-10 text-left bg-gray-200 bg-opacity-50 hover:bg-opacity-70 text-slate-900 rounded-xl cursor-default focus-styles"
      >
        {{ localValue.label }}
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
        >
          <ChevronUpDownIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
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
import { PropType, ref, toRefs, watch } from "vue";

const props = defineProps({
  startingOption: {
    type: Object as PropType<{
      label: string;
      onSelect?: () => void;
    }>,
    required: true,
  },
  options: {
    type: Array as PropType<{ label: string; onSelect: () => void }[]>,
    required: true,
  },
});
toRefs(props);

const localValue = ref(props.startingOption);
watch(localValue, (newVal) => {
  newVal.onSelect?.();
});
</script>
