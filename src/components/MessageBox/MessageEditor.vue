<template>
  <form
    class="rounded-md border border-solid border-gray-300 bg-white w-[420px]"
    @submit.prevent="sendMessage"
  >
    <p class="text-sm font-semibold p-4 border-b border-solid border-gray-200">
      Messaging {{ message.to }}
    </p>
    <TipTapEditor
      v-model="messageBody"
      placeholder="Compose a message"
      editor-height="h-80"
    />
    <div class="p-4 rounded-lg bg-gray-100 m-2 flex items-center gap-2">
      <FormCheckbox id="share-email" v-model="shareEmail" />
      <FormLabel class="font-normal" for="share-email" :no-margin="true">
        Share my email
      </FormLabel>
    </div>
    <div
      class="flex flex-col align-end gap-2 p-4 border-t border-solid border-gray-200"
    >
      <div class="flex justify-end gap-2">
        <GhostButton type="button" @click="handleClose(message.id)"
          >Discard</GhostButton
        >
        <PrimaryButton :is-loading="message.isSubmitting">
          <EnvelopeIcon class="w-6 h-6 mr-2" />
          Send
        </PrimaryButton>
      </div>
    </div>
  </form>
</template>
<script setup lang="ts">
import { PropType, ref } from "vue";
import { MessageBoxMessage } from "./useMessageBox";
import { EnvelopeIcon } from "@heroicons/vue/24/outline";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import GhostButton from "../Buttons/GhostButton.vue";
import FormCheckbox from "../Forms/FormCheckbox.vue";
import FormLabel from "../Forms/FormLabel.vue";
import TipTapEditor from "../TipTapEditor.vue";

const props = defineProps({
  message: {
    type: Object as PropType<MessageBoxMessage>,
    required: true,
  },
});

const messageBody = ref("");
const shareEmail = ref(false);

const emit = defineEmits(["closeMessage"]);

function handleClose(messageId: string) {
  emit("closeMessage", messageId);
}

function sendMessage() {
  props.message.onSend({
    message: messageBody.value,
    shareEmail: shareEmail.value,
    messageId: props.message.id,
  });
}
</script>
