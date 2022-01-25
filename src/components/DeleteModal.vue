<template>
  <Modal :title="title" :open="open">
    <p class="prose prose-sm">
      {{ message }}
    </p>
    <div class="mt-2 flex justify-end space-x-2">
      <OutlineButton @click="emit('cancel')">Cancel</OutlineButton>
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
import OutlineButton from "./Buttons/OutlineButton.vue";

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
