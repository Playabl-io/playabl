<template>
  <Heading level="h6" as="h2" class="mb-2">Access times</Heading>
  <p class="text-sm text-slate-700 dark:text-slate-300 mb-4">
    Select what access levels to apply. Mandatory access levels are
    automatically selected.
  </p>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <label
      v-for="level in store.communityAccessLevels"
      :for="level.id"
      :key="level.id"
      class="relative p-4 rounded-md border border-solid grid place-items-center cursor-pointer transition-all duration-150 ease-out"
      :class="[
        enabledLevels.includes(level.id)
          ? 'bg-teal-50 border-teal-500 shadow-md'
          : 'bg-white border-gray-300',
      ]"
    >
      <StarIcon
        class="h-5 w-5 absolute top-2 right-2"
        :class="[level.is_mandatory ? 'text-amber-300' : 'text-slate-400']"
      />
      <input
        type="checkbox"
        class="hidden"
        :chekced="enabledLevels.includes(level.id)"
        :id="level.id"
        :value="level.id"
        :disabled="level.is_mandatory"
        @change="handleChange($event, level.id)"
        hidden
      />
      <p class="font-semibold">{{ level.name }}</p>
      <p class="text-slate-700 text-sm">
        {{ level.priority_access_time }} {{ level.time_denomination }} of
        priority time
      </p>
    </label>
  </div>
</template>
<script setup lang="ts">
import { PropType, toRefs } from "vue";
import { store } from "@/store";
import { StarIcon } from "@heroicons/vue/solid";
import Heading from "../Heading.vue";

const emit = defineEmits(["update"]);

const props = defineProps({
  enabledLevels: {
    type: Array as PropType<string[]>,
    required: true,
  },
});
toRefs(props);

function handleChange(event: Event, id: string) {
  const element = event.target as HTMLInputElement;
  const nextVal = element.checked
    ? props.enabledLevels.concat(id)
    : props.enabledLevels.filter((val) => val !== id);
  emit("update", nextVal);
}
</script>
