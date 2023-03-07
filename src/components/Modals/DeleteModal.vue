<template>
  <BaseModal :title="title" :open="open">
    <slot name="body">
      <p class="prose">
        {{ message }}
      </p>
    </slot>
    <div class="mt-4 flex justify-end space-x-4">
      <GhostButton @click="emit('cancel')">Cancel</GhostButton>
      <WarningButton :is-loading="isDeleting" @click="emit('delete')">
        {{ deleteText }}
      </WarningButton>
    </div>
  </BaseModal>
</template>
<script setup lang="ts">
import WarningButton from "../Buttons/WarningButton.vue";
import BaseModal from "./BaseModal.vue";
import GhostButton from "../Buttons/GhostButton.vue";

defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
  deleteText: {
    type: String,
    default: "Delete",
  },
});

const emit = defineEmits(["delete", "cancel"]);
</script>
