<template>
  <div class="max-w-4xl mx-auto flex flex-col">
    <Heading level="h4" as="h1" class="mb-12"> Choose a community </Heading>
    <Listbox v-model="selectedCommunity">
      <div class="relative mt-1">
        <ListboxButton
          class="relative h-10 w-full py-2 pl-3 pr-10 text-left bg-white text-slate-900 rounded-lg border border-solid border-gray-300 cursor-default focus-styles"
        >
          <span class="block truncate">{{
            selectedCommunity?.name || "Select a community"
          }}</span>
          <span
            class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
          >
            <ChevronUpDownIcon
              class="w-5 h-5 text-gray-400"
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
            class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus-styles"
          >
            <ListboxOption
              v-for="community in communities"
              v-slot="{ active, selected }"
              :key="community.id"
              :value="community"
              as="template"
            >
              <li
                :class="[
                  active ? 'text-brand-500 bg-violet-100' : 'text-gray-900',
                  'cursor-default select-none relative py-2 pl-10 pr-4',
                ]"
              >
                <span
                  :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'block truncate',
                  ]"
                >
                  {{ community.name }}
                </span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-500"
                >
                  <CheckIcon class="w-5 h-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <PrimaryButton
      class="w-full mt-6"
      :disabled="!selectedCommunity"
      :is-loading="loading"
      @click="emit('select', { community: selectedCommunity })"
    >
      Next
    </PrimaryButton>
  </div>
</template>
<script setup lang="ts">
import { PropType, ref, toRefs } from "vue";
import { Community } from "@/typings/Community";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/24/outline";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import Heading from "../Heading.vue";

const selectedCommunity = ref<Community>();

const emit = defineEmits(["select"]);

const props = defineProps({
  communities: {
    type: Array as PropType<Community[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});
toRefs(props);
</script>
