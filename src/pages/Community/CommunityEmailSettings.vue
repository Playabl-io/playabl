<template>
  <form class="grid gap-2" @submit.prevent="handleSubmit">
    <Heading level="h6" as="h2"> Email Settings </Heading>
    <p class="text-sm text-slate-700 mb-4">
      You can set a specific support email and recieve notifications there for
      admin items such as membership requests. Community Admins automatically
      are notified and can control email from their profile settings.
    </p>
    <div class="flex flex-col">
      <FormLabel for="description">Support email</FormLabel>
      <FormInput id="description" v-model="supportEmail" type="email" />
    </div>
    <PrimaryButton :is-loading="isSaving"> Update </PrimaryButton>
  </form>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import { communityStore } from "./communityStore";
import { Community } from "@/typings/Community";
import { updateCommunity } from "@/api/communities";
import useToast from "@/components/Toast/useToast";

const { showError, showSuccess } = useToast();

const isSaving = ref(false);
const supportEmail = ref(communityStore.community.support_email ?? "");

async function handleSubmit() {
  isSaving.value = true;
  try {
    const update: Partial<Community> = {
      support_email: supportEmail.value,
    };
    await updateCommunity({
      communityId: communityStore.community.id,
      update,
    });
    showSuccess({ message: "Community email settings updated!" });
    communityStore.community = { ...communityStore.community, ...update };
  } catch (error) {
    showError({ message: "Unable to update community email settings" });
  } finally {
    isSaving.value = false;
  }
}
</script>
