<template>
  <div class="relative">
    <FormInput v-model="name" class="w-full" />
    <svg
      v-if="state === 'searching'"
      class="animate-spin absolute top-2 right-3 h-6 w-6 text-brand-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <CheckCircleIcon
      v-else-if="state === 'available'"
      class="absolute top-2 right-3 h-6 w-6 text-green-600"
    />
    <XCircleIcon
      v-else-if="state === 'unavailable'"
      class="absolute top-2 right-3 h-6 w-6 text-red-600"
    />
  </div>
  <p class="text-sm text-slate-700 mt-2">
    <template v-if="state === 'initial'">
      This is your current community name
    </template>
    <template v-else-if="state === 'available'">
      <span class="font-semibold">{{ name }}</span> is available!
    </template>
    <template v-else-if="state === 'unavailable' && name !== ''">
      <span class="font-semibold"
        >{{ name }} is <span class="font-semibold">not</span> available. Please
        select another name.</span
      >
    </template>
    <template v-else-if="state === 'unavailable' && name === ''">
      Enter the new name you would like to check
    </template>
    <template v-else-if="state === 'searching' || state === 'updated'">
      Checking...
    </template>
  </p>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import FormInput from "@/components/Forms/FormInput.vue";
import { isCommunityNameAvailable } from "@/api/communities";
import { communityStore } from "./communityStore";

const props = defineProps<{
  currentName: string;
}>();

const emit = defineEmits<{
  available: [value: string];
  unavailable: [];
}>();

const state = ref<
  "initial" | "updated" | "searching" | "available" | "unavailable"
>("initial");

const name = ref<string>(props.currentName);

watch(
  () => props.currentName,
  () => {
    state.value = "initial";
    name.value = props.currentName;
  }
);

watch(name, (val) => {
  if (val === props.currentName) {
    state.value = "initial";
    emit("unavailable");
    return;
  } else if (val === "") {
    state.value = "unavailable";
    emit("unavailable");
    return;
  }
  state.value = "updated";
});

watchDebounced(
  name,
  async (val) => {
    if (state.value !== "updated") return;
    state.value = "searching";
    emit("unavailable");
    const isAvailable = await isCommunityNameAvailable({
      name: val,
      id: communityStore.community.id,
    });
    if (isAvailable) {
      state.value = "available";
      emit("available", val);
    } else {
      state.value = "unavailable";
      emit("unavailable");
    }
  },
  { debounce: 750 }
);
</script>
