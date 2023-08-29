<template>
  <Listbox :model-value="modelValue" multiple @update:model-value="onUpdate">
    <div class="relative z-10">
      <ListboxButton
        class="relative w-full h-10 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 border-solid focus-styles sm:text-sm"
      >
        <span class="block truncate">{{
          modelValue.length > 0
            ? modelValue
                .map(
                  (val) => options.find((option) => option.value === val)?.label
                )
                .join(", ")
            : label
        }}</span>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <ChevronUpDownIcon
            class="h-5 w-5 text-slate-400"
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
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-2 shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="option in options"
            v-slot="{ active, selected }"
            :key="option.value"
            :value="option.value"
            as="template"
          >
            <li
              :class="[
                active ? 'bg-violet-100 text-brand-500' : 'bg-white',
                'relative cursor-default select-none p-2 flex items-center justify-between rounded-md',
              ]"
            >
              <span
                :class="[
                  selected ? 'font-medium ' : 'font-normal',
                  'block truncate',
                ]"
                >{{ option.label }}</span
              >
              <span v-if="selected" class="text-brand-500">
                <CheckCircleIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import { CheckCircleIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";

type Option = {
  label: string;
  value: string | number;
};

defineProps({
  modelValue: {
    type: Array as PropType<Option["value"][]>,
    required: true,
  },
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  label: {
    type: String,
    default: "Select",
  },
});

const emit = defineEmits(["update:modelValue"]);

function onUpdate(val: Option[]) {
  emit("update:modelValue", val);
}
</script>
