<template>
  <div class="flex gap-2 items-center">
    <input
      ref="hourInput"
      :value="hour"
      aria-label="Hours"
      type="number"
      class="self-stretch rounded-md border-gray-300 text-2xl w-1/3 grow invalid:border-red-500 invalid:border-2"
      :required="required"
      @input="formatHour"
    />
    <p class="text-2xl font-bold">:</p>
    <input
      ref="minuteInput"
      :value="minute"
      aria-label="Minutes"
      type="number"
      class="self-stretch rounded-md border-gray-300 text-2xl w-1/3 grow invalid:border-red-500 invalid:border-2"
      :required="required"
      @input="formatMinute"
    />
    <div class="flex flex-col gap-1 w-12 md:w-10">
      <ToggleRadio
        :id="`am-${id}`"
        v-model="meridian"
        class="text-xs"
        :name="`meridian-${id}`"
        value="AM"
      >
        AM
      </ToggleRadio>
      <ToggleRadio
        :id="`pm-${id}`"
        v-model="meridian"
        class="text-xs"
        :name="`meridian-${id}`"
        value="PM"
      >
        PM
      </ToggleRadio>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import ToggleRadio from "./ToggleRadio.vue";

defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => uuidv4(),
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
