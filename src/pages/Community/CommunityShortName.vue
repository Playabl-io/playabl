<template>
  <form @submit.prevent="handleSave">
    <Heading as="h2" level="h6" class="mb-2">Customize your URL</Heading>
    <p class="mb-6 text-sm text-slate-700">Customize your community url</p>
    <div class="relative">
      <FormInput v-model="shortName" class="w-full" />
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
    <p class="mt-2 text-sm text-slate-700">
      May only include letters, numbers, -, or _
    </p>
    <p
      v-if="state === 'invalid'"
      class="font-semibold text-sm mt-4 text-red-700"
    >
      Your url contains invalid characters
    </p>
    <PrimaryButton
      :is-loading="saving"
      :disabled="state !== 'available'"
      class="mt-6 w-full"
      >Save</PrimaryButton
    >
  </form>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import FormInput from "@/components/Forms/FormInput.vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import useToast from "@/components/Toast/useToast";
import { isShortNameAvailable, updateCommunity } from "@/api/communities";
import { communityStore } from "./communityStore";

const { showSuccess, showError } = useToast();

const state = ref<
  "initial" | "updated" | "invalid" | "searching" | "available" | "unavailable"
>("initial");
const shortName = ref<string>(communityStore.community.url_short_name || "");
const saving = ref(false);

const allowedCharactersRegEx = /[^a-zA-Z0-9_-]/;
watch(shortName, (val) => {
  state.value = "updated";
  const containsInvalidCharacter = allowedCharactersRegEx.test(val);
  if (containsInvalidCharacter) {
    state.value = "invalid";
  }
});

watchDebounced(
  shortName,
  async (val) => {
    if (state.value === "invalid") return;
    state.value = "searching";
    const isAvailable = await isShortNameAvailable({
      shortName: val,
      id: communityStore.community.id,
    });
    if (isAvailable) {
      state.value = "available";
    } else {
      state.value = "unavailable";
    }
  },
  { debounce: 750 }
);

async function handleSave() {
  saving.value = true;
  try {
    await updateCommunity({
      communityId: communityStore.community.id,
      update: {
        url_short_name: shortName.value,
      },
    });
    communityStore.community.url_short_name = shortName.value;
    state.value = "initial";
    showSuccess({ message: "Custom URL updated!" });
  } catch (error) {
    showError({ message: "Unable to save custom URL name" });
  } finally {
    saving.value = false;
  }
}
</script>
