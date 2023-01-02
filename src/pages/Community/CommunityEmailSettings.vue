<template>
  <form class="grid gap-2" @submit.prevent="handleSubmit">
    <Heading level="h6" as="h2"> Email Settings </Heading>
    <p class="text-sm text-slate-700 mb-4">
      You can set a specific support email and any messages sent to the
      community will be sent to this address. Additionally, you can choose to
      subscribe individual Admins to support emails.
    </p>
    <div class="flex flex-col">
      <FormLabel for="description">Support email</FormLabel>
      <FormInput id="description" v-model="supportEmail" type="email" />
    </div>
    <Well>
      <p class="mb-2 font-semibold text-sm">
        Subscribe Admins to support messages
      </p>
      <div
        v-for="admin in communityStore.admins"
        :key="admin.id"
        class="flex items-center gap-2"
      >
        <FormCheckbox
          :id="admin.id"
          v-model="supportMessageSubscriptions"
          :value="{ name: admin.username, email: admin.email }"
        />
        <FormLabel :for="admin.id" class="font-normal" no-margin>
          {{ admin.username || admin.email }}
        </FormLabel>
      </div>
    </Well>
    <PrimaryButton :is-loading="isSaving"> Update </PrimaryButton>
  </form>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import Well from "@/components/Well.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import { communityStore } from "./communityStore";
import { Community } from "@/typings/Community";
import { updateCommunity } from "@/api/communities";
import useToast from "@/components/Toast/useToast";

const { showError, showSuccess } = useToast();

const isSaving = ref(false);
const supportEmail = ref(communityStore.community.support_email ?? "");
const supportMessageSubscriptions = ref(
  communityStore.community.support_message_subscriptions ?? []
);

async function handleSubmit() {
  isSaving.value = true;
  try {
    const update: Partial<Community> = {
      support_email: supportEmail.value,
      support_message_subscriptions: supportMessageSubscriptions.value,
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
