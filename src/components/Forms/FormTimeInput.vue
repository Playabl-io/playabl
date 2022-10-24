<template>
  <div class="flex gap-2 items-center">
    <input
      ref="hourInput"
      :value="hour"
      aria-label="Hours"
      type="number"
      class="rounded-md border-gray-300 text-2xl w-1/3 grow self-stretch invalid:border-red-500 invalid:border-2"
      @input="formatHour"
    />
    <p class="text-2xl font-bold">:</p>
    <input
      ref="minuteInput"
      :value="minute"
      aria-label="Minutes"
      type="number"
      class="rounded-md border-gray-300 text-2xl w-1/3 grow self-stretch invalid:border-red-500 invalid:border-2"
      @input="formatMinute"
    />
    <div class="flex flex-col gap-1 w-12 md:w-10">
      <button
        type="button"
        class="rounded-md py-1 px-2 border border-solid border-gray-300 text-xs"
        :class="{
          'bg-blue-500 text-white border-transparent font-semibold':
            meridian === 'AM',
        }"
        @click="meridian = 'AM'"
      >
        AM
      </button>
      <button
        type="button"
        class="rounded-md py-1 px-2 border border-solid border-gray-300 text-xs"
        :class="{
          'bg-blue-500 text-white border-transparent font-semibold':
            meridian === 'PM',
        }"
        @click="meridian = 'PM'"
      >
        PM
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import FormInput from "./FormInput.vue";

const props = defineProps({
  time: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["setTime"]);

const hour = ref("");
const hourInput = ref<HTMLInputElement>();
const minute = ref("");
const minuteInput = ref<HTMLInputElement>();
const meridian = ref();

function formatHour(event: Event) {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  const int = parseInt(String(val), 10) % 12;
  if (Number.isNaN(int)) {
    hour.value = "00";
    return;
  }
  if (int < 1) {
    hour.value = "12";
    return;
  }
  hour.value = int.toString().padStart(2, "0");
}

function formatMinute(event: Event) {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  const int = parseInt(String(val), 10) % 60;
  if (Number.isNaN(int)) {
    minute.value = "00";
    return;
  }
  if (int < 0) {
    minute.value = "59";
    return;
  }
  minute.value = int.toString().padStart(2, "0");
}

watch(
  () => props.time,
  (newValue) => {
    if (newValue !== "") {
      const [hours, minutes] = newValue.split(":");
      meridian.value = Number(hours) > 12 ? "PM" : "AM";
      hour.value = `${Number(hour) % 12}`;
      minute.value = minutes;
    }
  }
);

watch([hour, minute, meridian], ([newHour, newMinute, newMeridian]) => {
  if (!newHour || !newMinute || !newMeridian) return;
  if (
    !hourInput.value?.checkValidity() ||
    !minuteInput.value?.checkValidity()
  ) {
    return;
  }

  let resultHour: string | number = "";
  if (meridian.value === "PM") {
    if (Number(newHour) === 12) {
      resultHour = newHour;
    } else {
      resultHour = Number(newHour) + 12;
    }
  }
  if (meridian.value === "AM") {
    if (Number(newHour) === 12) {
      resultHour = "00";
    } else {
      resultHour = newHour;
    }
  }

  emit("setTime", `${resultHour}:${newMinute}`);
});
</script>
