<template>
  <div>
    <Heading level="h6" as="h2" class="mb-2">Access times</Heading>
    <p
      v-if="setByEvent"
      class="text-sm text-slate-700 dark:text-slate-300 mb-3"
    >
      Access policiles have been set by the event and cannot be changed.
    </p>
    <template v-else>
      <p class="text-sm text-slate-700 dark:text-slate-300 mb-3">
        Select what access levels to apply. Not sure how access levels work?
        <a
          href="https://docs.playabl.io/communities/access-levels.html"
          target="_blank"
          class="text-blue-700 underline"
        >
          Read more in our docs.
        </a>
      </p>
      <p class="text-xs text-slate-700 dark:text-slate-300 mb-1">
        Mandatory access levels
        <StarIcon
          class="h-4 w-4 text-amber-300 inline-block -translate-y-1/3 -translate-x-1 -mr-1"
        />
        are automatically selected.
      </p>
    </template>
    <div v-if="!setByEvent" class="grid" :class="grid">
      <label
        v-for="level in store.communityAccessLevels"
        :key="level.id"
        :for="String(level.id)"
        class="relative p-4 rounded-md border border-solid grid place-items-center cursor-pointer transition-all duration-150 ease-out"
        :class="[
          enabledLevels.includes(level.id)
            ? 'bg-teal-50 border-teal-500 shadow-md'
            : 'bg-white border-gray-300',
        ]"
      >
        <StarIcon
          v-if="level.is_mandatory"
          class="h-5 w-5 absolute text-amber-300 top-2 right-2"
        />
        <input
          :id="String(level.id)"
          type="checkbox"
          class="hidden"
          :checked="enabledLevels.includes(level.id)"
          :value="level.id"
          :disabled="level.is_mandatory || disable"
          hidden
          @change="handleChange($event, level.id)"
        />
        <p class="font-semibold">{{ level.name }}</p>
        <p class="text-slate-700 text-sm text-center">
          {{ level.priority_access_time }} {{ level.time_denomination }} of
          priority time
        </p>
        <hr class="w-full my-2" />
        <p v-if="accessTimes[level.id]" class="text-slate-700 text-xs">
          Can RSVP at
          {{
            format(
              new Date(accessTimes[level.id].rsvpAvailableTime),
              "EEE, MMM do, h:mm a"
            )
          }}
        </p>
        <p v-else class="text-slate-700 text-xs">
          Not selected - no access granted
        </p>
      </label>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType, computed } from "vue";
import { store } from "@/store";
import { StarIcon } from "@heroicons/vue/20/solid";
import Heading from "../Heading.vue";
import { rsvpTimes } from "@/util/time";
import { format } from "date-fns";
import { AccessLevel } from "@/typings/AccessLevel";

const emit = defineEmits(["update"]);

const props = defineProps({
  enabledLevels: {
    type: Array as PropType<number[]>,
    required: true,
  },
  grid: {
    type: String,
    default: "md:grid-cols-3 gap-6",
  },
  disable: {
    type: Boolean,
    default: false,
  },
  setByEvent: {
    type: Boolean,
    default: false,
  },
});

const selectedLevels = computed(() =>
  props.enabledLevels.reduce((acc, id) => {
    const level = store.communityAccessLevels.find((level) => level.id === id);
    if (level) {
      acc.push(level);
    }
    return acc;
  }, [] as AccessLevel[])
);

const accessTimes = computed(() => {
  return rsvpTimes(selectedLevels.value);
});

function handleChange(event: Event, id: number) {
  const element = event.target as HTMLInputElement;
  const nextVal = element.checked
    ? props.enabledLevels.concat(id)
    : props.enabledLevels.filter((val) => val !== id);
  emit("update", nextVal);
}
</script>
