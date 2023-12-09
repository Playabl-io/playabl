<template>
  <div
    class="h-full border border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-lg flex flex-col"
    :class="{
      'max-w-md': size === 'medium',
      'w-full': size === 'full',
    }"
    @keydown.escape="emit('close')"
  >
    <div class="px-2 pb-2 flex flex-wrap sm:gap-2 justify-center items-center">
      <div class="py-2 flex space-x-2 items-center justify-center">
        <GhostButton
          type="button"
          aria-label="Previous month"
          @click="previousMonth"
        >
          <ChevronLeftIcon class="h-6 w-6" />
        </GhostButton>
        <label aria-live="polite" class="font-bold text-center w-48">
          {{ format(viewReference, "LLLL yyyy") }}
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
        class="p-2 border-t border-solid border-slate-200 dark:border-slate-700"
      >
        {{ weekday.label }}
      </li>
    </ol>
    <ol
      class="grid grid-cols-7 gap-1 p-1 flex-1"
      @keydown.left.prevent="previousDay"
      @keydown.right.prevent="nextDay"
      @keydown.up.prevent="previousWeek"
      @keydown.down.prevent="nextWeek"
    >
      <button
        v-for="day in daysOfMonth"
        :id="`${day.getTime()}`"
        :key="day.getTime()"
        class="w-full h-full p-2 rounded-md flex focus-styles disabled:cursor-not-allowed disabled:opacity-40"
        :class="
          modelValue.some((date) => isEqual(day, date))
            ? 'bg-brand-500 text-white'
            : isSameMonth(day, viewReference)
            ? 'bg-slate-200'
            : 'opacity-60'
        "
        type="button"
        :disabled="!dayIsWithinRange(day)"
        @click="handleSelect(day)"
      >
        {{ format(day, "dd") }}
      </button>
    </ol>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, PropType } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import {
  isBefore,
  isEqual,
  isSameDay,
  isSameMonth,
  eachDayOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfDay,
  isAfter,
  max,
} from "date-fns";
import GhostButton from "../Buttons/GhostButton.vue";
import { getStartOfToday } from "@/util/time";
const emit = defineEmits(["select", "close", "update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Array as PropType<Date[]>,
    required: true,
  },
  size: {
    type: String,
    validator: (val: string) => ["medium", "full"].includes(val),
    default: "full",
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

const today = getStartOfToday();
const viewReference = ref(max([today, props.notBefore]));

const weekdays = [
  { label: "Sun", abbr: "Sunday" },
  { label: "Mon", abbr: "Monday" },
  { label: "Tue", abbr: "Tuesday" },
  { label: "Wed", abbr: "Wednesday" },
  { label: "Thu", abbr: "Thursday" },
  { label: "Fri", abbr: "Friday" },
  { label: "Sat", abbr: "Saturday" },
];

// used to build the view of the visible month
const daysOfMonth = computed(() => {
  const startDate = startOfMonth(viewReference.value);
  const endDate = endOfMonth(viewReference.value);
  return eachDayOfInterval({
    start: startOfWeek(startDate),
    end: endOfWeek(endDate),
  });
});

function dayIsWithinRange(day: Date) {
  const isAfterNotBefore = props.notBefore
    ? isSameDay(day, props.notBefore) || isAfter(day, props.notBefore)
    : true;
  const isBeforeNotAfter = props.notAfter
    ? isSameDay(day, props.notAfter) || isBefore(day, props.notAfter)
    : true;
  return isAfterNotBefore && isBeforeNotAfter;
}

function handleSelect(day: Date) {
  viewReference.value = day;

  emit(
    "update:modelValue",
    props.modelValue.find((val) => isEqual(val, day))
      ? props.modelValue.filter((val) => !isEqual(val, day))
      : props.modelValue.concat(day),
  );
}
function goToToday() {
  viewReference.value = today;
  focusActiveDay();
}
function nextDay() {
  const nextDay = addDays(viewReference.value, 1);
  viewReference.value = nextDay;
  focusActiveDay();
}
function previousDay() {
  const nextDay = subDays(viewReference.value, 1);
  viewReference.value = nextDay;
  focusActiveDay();
}
function nextWeek() {
  const nextDay = addWeeks(viewReference.value, 1);
  viewReference.value = nextDay;
  focusActiveDay();
}
function previousWeek() {
  const nextDay = subWeeks(viewReference.value, 1);
  viewReference.value = nextDay;
  focusActiveDay();
}
function previousMonth() {
  const nextDate = subMonths(viewReference.value, 1);
  viewReference.value = nextDate;
  focusActiveDay();
}
function nextMonth() {
  const nextDate = addMonths(viewReference.value, 1);
  viewReference.value = nextDate;
  focusActiveDay();
}
function focusActiveDay() {
  nextTick(() => {
    document
      .getElementById(`${startOfDay(viewReference.value).getTime()}`)
      ?.focus();
  });
}
</script>
