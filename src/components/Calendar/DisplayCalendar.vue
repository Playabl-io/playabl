<template>
  <div
    class="w-full h-full border border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-lg flex flex-col"
  >
    <div class="px-2 pb-2 flex flex-wrap sm:gap-2 justify-between items-center">
      <div class="py-2 flex space-x-2 items-center justify-center">
        <GhostButton
          type="button"
          aria-label="Previous month"
          @click="previousMonth"
        >
          <ChevronLeftIcon class="h-6 w-6" />
        </GhostButton>
        <label aria-live="polite" class="font-bold text-center w-48">
          {{ format(firstOfActiveMonth, "LLLL yyyy") }}
        </label>
        <GhostButton type="button" aria-label="Next month" @click="nextMonth">
          <ChevronRightIcon class="h-6 w-6" />
        </GhostButton>
      </div>
      <GhostButton type="button" @click="goToToday"> Today </GhostButton>
    </div>
    <ol class="grid grid-cols-7 text-sm text-slate-600 dark:text-slate-400">
      <li
        v-for="weekday in weekdays"
        :key="weekday.label"
        :abbr="weekday.abbr"
        class="p-2 border-b border-solid border-slate-200 dark:border-slate-700"
      >
        {{ weekday.label }}
      </li>
    </ol>
    <ol
      class="grid grid-cols-7 gap-0.5 flex-1 bg-gradient-to-br from-fuchsia-400 to-cyan-300"
    >
      <button
        v-for="day in daysOfMonth"
        :key="day.getTime()"
        class="text-slate-600 w-full h-20 p-2 flex flex-col bg-white text-sm hover:bg-gray-100 focus:ring-blue-700"
        :class="{
          'text-slate-900 font-semibold': isSameMonth(day, firstOfActiveMonth),
          'bg-cyan-100': isSameDay(day, today),
          'ring-2 ring-blue-700 ring-inset': isSameDay(day, selectedDate),
        }"
        @click="emit('selectDate', day)"
      >
        {{ format(day, "dd") }}
        <div class="font-normal text-sm flex flex-col w-full grow">
          <slot name="day" v-bind="day"></slot>
        </div>
      </button>
    </ol>
  </div>
</template>
<script setup lang="ts">
import { computed, toRefs, PropType } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import {
  isSameDay,
  isSameMonth,
  eachDayOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import GhostButton from "../Buttons/GhostButton.vue";
const emit = defineEmits(["updateDate", "selectDate"]);
const props = defineProps({
  size: {
    type: String,
    validator: (val: string) => ["medium", "full"].includes(val),
    default: "full",
  },
  events: {
    type: Array as PropType<{ start_time: number }[]>,
    default: () => [],
  },
  referenceDate: {
    type: Object as PropType<Date>,
    required: true,
  },
  selectedDate: {
    type: Object as PropType<Date>,
    default: null,
  },
});
toRefs(props);

const firstOfActiveMonth = computed(() => startOfMonth(props.referenceDate));

const today = new Date();

const weekdays = [
  { label: "Sun", abbr: "Sunday" },
  { label: "Mon", abbr: "Monday" },
  { label: "Tue", abbr: "Tuesday" },
  { label: "Wed", abbr: "Wednesday" },
  { label: "Thu", abbr: "Thursday" },
  { label: "Fri", abbr: "Friday" },
  { label: "Sat", abbr: "Saturday" },
];

const daysOfMonth = computed(() => {
  const endDate = endOfMonth(firstOfActiveMonth.value);
  return eachDayOfInterval({
    start: startOfWeek(firstOfActiveMonth.value),
    end: endOfWeek(endDate),
  });
});
function previousMonth() {
  const nextDate = subMonths(firstOfActiveMonth.value, 1);

  emit("updateDate", nextDate);
}
function nextMonth() {
  const nextDate = addMonths(firstOfActiveMonth.value, 1);

  emit("updateDate", nextDate);
}
function goToToday() {
  const nextDate = startOfMonth(today);

  emit("updateDate", nextDate);
}
</script>
<style scoped></style>
