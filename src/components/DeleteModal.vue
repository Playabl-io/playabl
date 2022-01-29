<template>
  <Modal :title="title" :open="open">
    <p class="prose">
      {{ message }}
    </p>
    <div class="mt-2 flex justify-end space-x-2">
      <GhostButton @click="emit('cancel')">Cancel</GhostButton>
      <WarningButton :is-loading="isDeleting" @click="emit('delete')">
        Delete
      </WarningButton>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { toRefs } from "vue";
import WarningButton from "./Buttons/WarningButton.vue";
import Modal from "./Modal.vue";
import GhostButton from "./Buttons/GhostButton.vue";

const props = defineProps({
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
});
toRefs(props);

const emit = defineEmits(["delete", "cancel"]);
</script>
