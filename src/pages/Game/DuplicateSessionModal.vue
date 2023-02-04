<template>
  <BaseModal title="Duplicate session" :open="open" @close="emit('close')">
    <p class="prose">
      Create a copy of this session? The date, time, and RSVPs will be
      preserved, and you can edit it afterwards to set a new time if desired.
    </p>
    <div class="mt-2 flex justify-end space-x-4">
      <GhostButton @click="emit('close')">Cancel</GhostButton>
      <PrimaryButton :is-loading="saving" @click="handleDuplicate">
        Duplicate
      </PrimaryButton>
    </div>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref, PropType } from "vue";
import { Session } from "@/typings/Session";
import BaseModal from "@/components/Modals/BaseModal.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { addSession } from "@/api/gamesAndSessions";
import useToast from "@/components/Toast/useToast";
import { gameStore } from "./gameStore";

const { showError, showSuccess } = useToast();

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  session: {
    type: Object as PropType<Session>,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const saving = ref(false);

async function handleDuplicate() {
  saving.value = true;
  try {
    const newSession: Partial<Session> = { ...props.session };
    delete newSession.id;
    const insertedSession = await addSession(newSession);
    gameStore.sessions.push(insertedSession);
    showSuccess({ message: "Session duplicated!" });
    emit("close");
  } catch (error) {
    showError({ message: "Unable to duplicate session" });
  } finally {
    saving.value = false;
  }
}
</script>
