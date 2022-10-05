<template>
  <div
    class="border border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col"
    :class="{
      'max-w-md h-96': size === 'medium',
      'w-full h-full': size === 'full',
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
          {{ format(selected, "LLLL yyyy") }}
        </label>
        <GhostButton type="button" aria-label="Next month" @click="nextMonth">
          <ChevronRightIcon class="h-6 w-6" />
        </GhostButton>
      </div>
      <GhostButton type="button" :disabled="todayDisabled" @click="goToToday">
        Today
      </GhostButton>
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
        class="w-full h-full p-2 rounded-md flex focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus-visible:outline-none dark:focus:ring-sky-500 dark:focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40"
        :class="[
          isSameMonth(day, selected)
            ? 'bg-opacity-60 dark:bg-slate-900'
            : 'bg-opacity-10 dark:bg-slate-700',
          isEqual(day, selected)
            ? 'bg-slate-300 dark:bg-slate-800'
            : 'bg-slate-200',
        ]"
        type="button"
        :disabled="!dayIsWithinRange(day)"
        @focus="handleFocus(day)"
        @click="handleSelect(day)"
      >
        {{ format(day, "dd") }}
      </button>
    </ol>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, toRefs, onMounted } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import {
  isBefore,
  isEqual,
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
  isWithinInterval,
} from "date-fns";
import GhostButton from "../Buttons/GhostButton.vue";
const emit = defineEmits(["select", "close"]);
const props = defineProps({
  size: {
    type: String,
    validator: (val: string) => ["medium", "full"].includes(val),
    default: "full",
  },
  selected: {
    type: Date,
    required: true,
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
toRefs(props);

onMounted(focusActiveDay);

const today = startOfDay(new Date());
const todayDisabled =
  computed(() => isBefore(today, props.notBefore)) ||
  isAfter(today, props.notAfter);

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
  const startDate = startOfMonth(props.selected);
  const endDate = endOfMonth(props.selected);
  return eachDayOfInterval({
    start: startOfWeek(startDate),
    end: endOfWeek(endDate),
  });
});

function dayIsWithinRange(day: Date) {
  if (!props.notBefore || !props.notAfter) return true;
  return isWithinInterval(day, { start: props.notBefore, end: props.notAfter });
}

function handleFocus(day: Date) {
  emit("select", day);
}
function handleSelect(day: Date) {
  emit("select", day);
  emit("close");
}
function goToToday() {
  emit("select", today);
  focusActiveDay();
}
function nextDay() {
  const nextDay = addDays(props.selected, 1);
  emit("select", nextDay);
  focusActiveDay();
}
function previousDay() {
  const nextDay = subDays(props.selected, 1);
  if (props.notBefore && isBefore(nextDay, props.notBefore)) return;
  if (props.notAfter && isAfter(nextDay, props.notAfter)) return;
  emit("select", nextDay);
  focusActiveDay();
}
function nextWeek() {
  const nextDay = addWeeks(props.selected, 1);
  if (props.notAfter && isAfter(nextDay, props.notAfter)) return;
  emit("select", nextDay);
  focusActiveDay();
}
function previousWeek() {
  const nextDay = subWeeks(props.selected, 1);
  if (props.notBefore && isBefore(nextDay, props.notBefore)) return;
  if (props.notAfter && isAfter(nextDay, props.notAfter)) return;
  emit("select", nextDay);
  focusActiveDay();
}
function previousMonth() {
  const nextDate = subMonths(props.selected, 1);
  emit("select", nextDate);
  focusActiveDay();
}
function nextMonth() {
  const nextDate = addMonths(props.selected, 1);
  if (props.notAfter && isAfter(nextDate, props.notAfter)) return;
  emit("select", nextDate);
  focusActiveDay();
}
function focusActiveDay() {
  nextTick(() => {
    document.getElementById(`${startOfDay(props.selected).getTime()}`)?.focus();
  });
}
</script>
