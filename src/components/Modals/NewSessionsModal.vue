<template>
  <BaseModal :open="open" title="Add new sessions" @close="$emit('cancel')">
    <form @submit.prevent="handleSubmit">
      <Well>
        <p v-if="notBefore" class="text-sm">
          Earliest date available:
          <b>
            {{ format(notBefore, "LLLL do yyyy") }}
          </b>
        </p>
        <p v-if="notAfter" class="mt-2 text-sm">
          Latest date available:
          <b>
            {{ format(notAfter, "LLLL do yyyy") }}
          </b>
        </p>
        <p class="text-sm mt-2">
          All times are in your browser timezone:
          <b>{{ getUserTimezone() }}</b>
        </p>
      </Well>
      <div class="flex flex-col gap-4 mt-4">
        <div class="flex flex-col">
          <FormLabel>Start time</FormLabel>
          <FormInput v-model="startTime" required type="time" />
        </div>
        <div class="flex flex-col">
          <FormLabel>End time</FormLabel>
          <FormInput v-model="endTime" required type="time" />
          <FormLabel class="mt-2">
            <FormCheckbox v-model="endTimeIsNextDay" class="mr-1" />
            End time is next day
          </FormLabel>
        </div>
        <div v-if="dateError" class="bg-rose-100 py-2 px-3 rounded-md">
          <p class="text-rose-900">{{ dateError }}</p>
        </div>
        <div class="flex flex-col">
          <FormLabel>Select one or more days</FormLabel>
          <MultiDateCalendar
            v-model="selectedDates"
            :not-before="notBefore"
            :not-after="notAfter"
          />
        </div>
      </div>
      <div class="mt-6 flex gap-2 justify-end">
        <PrimaryButton>Continue</PrimaryButton>
        <SecondaryButton>Cancel</SecondaryButton>
      </div>
    </form>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { set, format, addDays, isBefore } from "date-fns";
import FormInput from "../Forms/FormInput.vue";
import FormLabel from "../Forms/FormLabel.vue";
import Well from "../Well.vue";
import BaseModal from "./BaseModal.vue";
import { getUserTimezone } from "@/util/time";
import MultiDateCalendar from "../Calendar/MultiDateCalendar.vue";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import SecondaryButton from "../Buttons/SecondaryButton.vue";
import FormCheckbox from "../Forms/FormCheckbox.vue";
import useToast from "../Toast/useToast";

const { showError } = useToast();

const startTime = ref("");
const endTime = ref("");
const endTimeIsNextDay = ref(false);
const selectedDates = ref<Date[]>([]);

function resetState() {
  startTime.value = "";
  endTime.value = "";
  endTimeIsNextDay.value = false;
  selectedDates.value = [];
}

defineProps<{
  open: boolean;
  notBefore: Date;
  notAfter?: Date;
}>();

const emit = defineEmits<{
  submit: [dates: { start: Date; end: Date }[]];
  cancel: [];
  close: [];
}>();

const dateError = computed(() => {
  if (!startTime.value || !endTime.value) {
    return "";
  }
  const baseDate = new Date();
  const [startHours, startMinutes] = startTime.value.split(":");
  const [endHours, endMinutes] = endTime.value.split(":");
  const startDateAndTime = set(baseDate, {
    hours: Number(startHours),
    minutes: Number(startMinutes),
  });
  let endDateAndTime = set(baseDate, {
    hours: Number(endHours),
    minutes: Number(endMinutes),
  });
  if (endTimeIsNextDay.value) {
    endDateAndTime = addDays(endDateAndTime, 1);
  }
  if (isBefore(endDateAndTime, startDateAndTime)) {
    return "End time cannot be before start time";
  }
  return "";
});

function handleSubmit() {
  if (selectedDates.value.length < 1) {
    showError({ message: "Please select one or more dates" });
    return;
  }
  if (dateError.value) {
    showError({ message: "Please correct the errors to continue" });
    return;
  }
  emit(
    "submit",
    selectedDates.value.map((date) => {
      const [startHours, startMinutes] = startTime.value.split(":");
      const [endHours, endMinutes] = endTime.value.split(":");
      const startDate = set(date, {
        hours: Number(startHours),
        minutes: Number(startMinutes),
      });
      let endDate = set(date, {
        hours: Number(endHours),
        minutes: Number(endMinutes),
      });
      if (endTimeIsNextDay.value) {
        endDate = addDays(endDate, 1);
      }
      return { start: startDate, end: endDate };
    }),
  );
  emit("close");
  resetState();
}
</script>
