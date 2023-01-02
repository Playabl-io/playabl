<template>
  <ProfileTemplate>
    <Heading as="h6" level="h6" class="mb-6">Reset your password</Heading>
    <ResetPasswordForm v-if="resetValid" />
    <div v-else>
      <p class="mb-6">
        To reset your password you must request a password reset and verify you
        are the account holder.
      </p>
      <RouterLink
        to="/forgot-password"
        class="mt-6 text-brand-500 hover:underline"
      >
        Request a password reset link.
      </RouterLink>
    </div>
  </ProfileTemplate>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { isAfter, subHours } from "date-fns";
import Heading from "@/components/Heading.vue";
import ProfileTemplate from "@/components/ProfileTemplate.vue";
import ResetPasswordForm from "@/components/ResetPasswordForm.vue";
import { store } from "@/store";

const now = new Date();

const resetValid = computed(() => {
  if (!store.userSession?.user.recovery_sent_at) {
    return false;
  }
  const recoverySentTime = new Date(store.userSession.user.recovery_sent_at);
  const expirationTime = subHours(now, 24);
  return isAfter(recoverySentTime, expirationTime);
});
</script>
