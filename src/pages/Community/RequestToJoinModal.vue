<template>
  <BaseModal
    :title="`Request to join ${communityName}`"
    :open="open"
    @close="emit('close')"
  >
    <form @submit.prevent="handleRequest">
      <p class="prose">
        Add an optional message to your request to provide any necessary
        information for the community managers.
      </p>
      <FormTextArea
        v-model="message"
        class="w-full mt-4 mb-8"
        aria-label="Message"
      />
      <div class="flex justify-end gap-2">
        <GhostButton :disabled="submitting" type="button" @click="emit('close')"
          >Cancel</GhostButton
        >
        <PrimaryButton :is-loading="submitting">Send request</PrimaryButton>
      </div>
    </form>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref } from "vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import BaseModal from "@/components/Modals/BaseModal.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { submitCommunityMembershipRequest } from "@/api/communityMemberships";
import useToast from "@/components/Toast/useToast";
import { store } from "@/store";
import { communityStore } from "./communityStore";

const { showSuccess, showError } = useToast();

const props = defineProps({
  communityName: {
    type: String,
    required: true,
  },
  communityId: {
    type: String,
    required: true,
  },
  open: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const message = ref("");
const submitting = ref(false);

async function handleRequest() {
  if (!store.user?.id) {
    showError({ message: "You must be signed in to complete this" });
    return;
  }
  submitting.value = true;
  try {
    const data = await submitCommunityMembershipRequest({
      communityId: props.communityId,
      userId: store.user.id,
      message: message.value,
      communityName: props.communityName,
    });
    communityStore.membershipRequest = data;
    showSuccess({ message: "Membership requested submitted!" });
    emit("close");
  } catch (e) {
    showError({ message: "Unable to submit membership request" });
  } finally {
    submitting.value = false;
  }
}
</script>
