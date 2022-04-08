<template>
  <div
    ref="container"
    class="relative w-full"
    @keydown.up.prevent="previousItem"
    @keydown.down.prevent="nextItem"
  >
    <FormInput
      :placeholder="placeholder"
      class="w-full"
      required
      :value="modelValue"
      @input="handleChange"
    />

    <button
      type="button"
      tabindex="-1"
      class="absolute inset-y-0 right-0 flex items-center px-2"
    >
      <SelectorIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
    </button>
    <transition
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-show="focused">
        <div v-if="filteredOptions.length > 0">
          <ul
            class="absolute z-10 grid w-full py-2 mt-2 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            static
          >
            <li
              v-for="(option, index) in filteredOptions"
              :key="option"
              :data-index="index"
              :class="[
                index === activeIndex || option === modelValue
                  ? 'text-brand-500 bg-violet-50'
                  : 'text-gray-900',
                'cursor-default select-none relative py-2 px-3 h-14',
              ]"
            >
              <button
                :class="[
                  option === modelValue ? 'font-medium' : 'font-normal',
                  'block truncate',
                ]"
                type="button"
                :data-option="option"
                class="w-full h-full text-left focus:outline-none"
                tabindex="-1"
                @click.prevent.stop="handleSelect(option)"
              >
                {{ option }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { SelectorIcon } from "@heroicons/vue/solid";
import { PropType, ref, watch } from "vue";
import { computed } from "@vue/reactivity";
import { useFocusWithin } from "@vueuse/core";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: true,
  },
  options: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const activeIndex = ref();
const container = ref<HTMLDivElement>();
const { focused } = useFocusWithin(container);

watch(focused, (focused) => {
  if (!focused) {
    activeIndex.value = undefined;
  }
});

function nextItem() {
  let nextIndex;
  if (activeIndex.value === undefined) {
    nextIndex = 0;
  } else {
    nextIndex = (activeIndex.value + 1) % filteredOptions.value.length;
  }
  activeIndex.value = nextIndex;
  const item = document.querySelector(`li[data-index="${nextIndex}"]`);
  const parent = item?.parentElement;
  const elementHeight = 56;
  const middle = elementHeight * 2;
  const nextScroll = nextIndex * elementHeight;
  parent?.scrollTo({ top: Math.max(nextScroll - middle, 0) });
  const child = item?.firstChild as HTMLButtonElement;
  child?.focus();
}
function previousItem() {
  let nextIndex;
  if (activeIndex.value === undefined) {
    nextIndex = filteredOptions.value.length - 1;
  } else {
    nextIndex = Math.abs(
      (activeIndex.value - 1 + filteredOptions.value.length) %
        filteredOptions.value.length
    );
  }
  activeIndex.value = nextIndex;
  const item = document.querySelector(`li[data-index="${nextIndex}"]`);
  const parent = item?.parentElement;
  const elementHeight = 56;
  const middle = elementHeight;
  const nextScroll = nextIndex * elementHeight;
  parent?.scrollTo({ top: Math.max(nextScroll - middle, 0) });
  const child = item?.firstChild as HTMLButtonElement;
  child?.focus();
}

const filteredOptions = computed(() =>
  props.options.filter((option) =>
    option.toLowerCase().includes(props.modelValue.toLowerCase())
  )
);

function handleChange(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.value);
}
function handleSelect(option: string) {
  emit("update:modelValue", option);
  const optionBtn = container.value?.querySelector(
    `button[data-option="${option}"]`
  ) as HTMLButtonElement;
  optionBtn?.blur();
}
</script>
