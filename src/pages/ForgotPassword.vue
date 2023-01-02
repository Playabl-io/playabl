<template>
  <BaseTemplate>
    <template v-if="submitted">
      <p>Check your email for a password reset link</p>
    </template>
    <template v-else>
      <Heading level="h6" as="h2" class="mb-12"
        >Request password reset email</Heading
      >
      <form class="flex flex-col" @submit.prevent="requestPasswordReset">
        <FormLabel>Email</FormLabel>
        <FormInput v-model="email" type="email" class="mb-6" />
        <PrimaryButton :is-loading="sending" type="submit" class="max-w-sm"
          >Submit</PrimaryButton
        >
      </form>
    </template>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref } from "vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { supabase } from "@/supabase";
import useToast from "@/components/Toast/useToast";

const { showError } = useToast();

const email = ref("");
const sending = ref(false);
const submitted = ref(false);

async function requestPasswordReset() {
  sending.value = true;
  try {
    await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${import.meta.env.VITE_PLAYABL_URL}/reset-password`,
    });
    submitted.value = true;
  } catch (error) {
    showError({ message: "Unable to complete request" });
  } finally {
    sending.value = false;
  }
}
</script>
