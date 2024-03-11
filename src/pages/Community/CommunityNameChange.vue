<template>
  <form @submit.prevent="handleSave">
    <Heading as="h2" level="h6" class="mb-2"
      >Change your community name</Heading
    >
    <p class="mb-6 text-sm text-slate-700">
      Community names must be unique. Enter your desired name to check if it is
      available.
    </p>
    <CommunityNameInput
      :current-name="communityStore.community.name"
      @available="setNextName"
      @unavailable="setNextName"
    />
    <PrimaryButton
      :disabled="!nextName"
      :is-loading="saving"
      class="mt-6 w-full"
      @click="handleSave"
      >Save</PrimaryButton
    >
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import useToast from "@/components/Toast/useToast";
import { communityStore } from "./communityStore";
import CommunityNameInput from "./CommunityNameInput.vue";
import { updateCommunity } from "@/api/communities";
import { log } from "@/util/logger";

const { showSuccess, showError } = useToast();
const saving = ref(false);
const nextName = ref<string | undefined>();

function setNextName(val?: string) {
  nextName.value = val;
}

async function handleSave() {
  saving.value = true;
  try {
    const updated = await updateCommunity({
      communityId: communityStore.community.id,
      update: { name: nextName.value },
    });
    communityStore.community.name = updated.name;
    showSuccess({ message: "Community name updated" });
    nextName.value = "";
  } catch (error) {
    log({ error });
    showError({
      message:
        "Unable to update community name. Please try again and report the issue.",
    });
  } finally {
    saving.value = false;
  }
}
</script>
