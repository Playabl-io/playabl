<template>
  <BaseTemplate v-if="store.authState === 'signedout'">
    <p class="text-center">{{ text }}</p>
    <SignUpModal :open="showSignUpModal" @cancel="showSignUpModal = false" />
  </BaseTemplate>
  <template v-else-if="store.authState === 'signedin'">
    <slot></slot>
  </template>
  <BaseTemplate v-else-if="store.authState === 'loading'">
    <div class="h-full grid place-content-center">
      <LoadingSpinner />
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { store } from "@/store";
import SignUpModal from "@/components/Modals/SignUpModal.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const showSignUpModal = ref(true);

defineProps({
  text: {
    type: String,
    default: "Sign in or create an account to continue",
  },
});
</script>
