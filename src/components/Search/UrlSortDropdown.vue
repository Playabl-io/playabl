<template>
  <div class="flex flex-col">
    <FormLabel>Sort</FormLabel>
    <Listbox @update:model-value="handleChange">
      <div class="relative">
        <ListboxButton
          class="relative h-10 w-full py-2 pl-3 pr-10 text-left bg-gray-200 bg-opacity-70 hover:bg-opacity-100 text-slate-900 rounded-xl cursor-default focus-styles"
        >
          {{ currentSort.label }}
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
              :key="option.value"
              :value="option.value"
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
  </div>
</template>
<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import { ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import FormLabel from "../Forms/FormLabel.vue";
import { useUrlSearchParams } from "@vueuse/core";
import { SORT_OPTIONS } from "@/util/urlParams";

const params = useUrlSearchParams("history");
const route = useRoute();
const router = useRouter();

const soonestOption = {
  label: "Starting soonest",
  value: SORT_OPTIONS.startTimeAsc,
};
const latestOption = {
  label: "Starting latest",
  value: SORT_OPTIONS.startTimeDesc,
};
const REVERSE_LOOKUP = {
  [SORT_OPTIONS.startTimeAsc]: soonestOption,
  [SORT_OPTIONS.startTimeDesc]: latestOption,
};

defineProps({
  label: {
    type: String,
    default: undefined,
  },
});

const options = [soonestOption, latestOption];

const currentSort = ref({ label: "", value: "" });

onMounted(() => {
  if (typeof params.sort === "string") {
    currentSort.value = REVERSE_LOOKUP[params.sort] || soonestOption;
  } else {
    console.error("too many sort options specified, using first");
    currentSort.value = REVERSE_LOOKUP[params.sort[0]] || soonestOption;
  }
});

function handleChange(newVal: string) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      sort: newVal,
    },
  });
}

watch(route, () => {
  if (route.query.sort && typeof route.query.sort === "string") {
    currentSort.value = REVERSE_LOOKUP[route.query.sort] || soonestOption;
  }
});
</script>
