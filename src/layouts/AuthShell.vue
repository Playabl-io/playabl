<template>
  <BaseTemplate v-if="!store.user">
    <p class="text-center">{{ text }}</p>
    <SignUpModal :open="showSignUpModal" @cancel="showSignUpModal = false" />
  </BaseTemplate>
  <template v-else>
    <slot></slot>
  </template>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { store } from "@/store";
import SignUpModal from "@/components/Modals/SignUpModal.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";

const showSignUpModal = ref(true);

defineProps({
  text: {
    type: String,
    default: "Sign in or create an account to continue",
  },
});
</script>
