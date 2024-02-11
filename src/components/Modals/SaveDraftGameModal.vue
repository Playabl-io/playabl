<template>
  <BaseModal title="Save draft game" :open="open">
    <p>
      You can save your game as a draft and finish creating it later. Your game
      will not be visible to the community or community managers while in a
      draft state. You can find your draft games from the
      <a class="text-blue-700 underline" target="_blank" :href="manageGamesUrl">
        Manage Games screen</a
      >
      to continue your progress later.
    </p>
    <div class="mt-6 flex justify-end gap-2">
      <GhostButton @click="emit('cancel')">Cancel</GhostButton>
      <PrimaryButton @click="emit('save')">Save as draft</PrimaryButton>
    </div>
  </BaseModal>
</template>
<script setup lang="ts">
import GhostButton from "../Buttons/GhostButton.vue";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import BaseModal from "./BaseModal.vue";

const manageGamesUrl = import.meta.env.VITE_PLAYABL_URL + "/games/manage";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  save: [];
}>();
</script>
