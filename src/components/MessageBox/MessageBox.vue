<template>
  <div class="absolute bottom-2 px-4 flex gap-6 w-full">
    <transition-group
      enter-active-class="transform-gpu duration-300 ease-out"
      leave-active-class="absolute transform-gpu duration-200"
      enter-from-class="opacity-0 scale-70"
      leave-to-class="opacity-0 scale-70"
      enter-to-class="opacity-1 scale-100"
      leave-from-class="opacity-1 scale-100"
      move-class="transform-gpu duration-300 ease-in"
    >
      <MessageEditor
        v-for="message in messages"
        :key="message.id"
        class="w-full max-w-md shadow-md"
        :message="message"
        @close-message="closeMessageBox"
      />
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import useMessageBox from "./useMessageBox";
import MessageEditor from "./MessageEditor.vue";

const { messages, closeMessageBox } = useMessageBox();
</script>
