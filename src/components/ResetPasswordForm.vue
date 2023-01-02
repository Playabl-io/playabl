<template>
  <form @submit.prevent="handleSubmit">
    <form-label class="flex flex-col"> New password </form-label>
    <div class="flex items-end">
      <form-input
        v-model="newPassword"
        class="grow"
        :class="{
          'border-green-500': passwordsValid,
          'border-red-500': passwordError,
        }"
        :type="showNewPw ? 'text' : 'password'"
        required
        :disabled="updating"
      />
      <GhostButton type="button" class="ml-1" @click="showNewPw = !showNewPw">
        <EyeSlashIcon v-if="showNewPw" class="h-5 w-6" />
        <EyeIcon v-else class="h-5 w-6" />
      </GhostButton>
    </div>
    <p v-if="passwordError" class="text-red-500 text-sm font-semibold mt-1">
      {{ passwordError }}
    </p>
    <form-label class="flex flex-col mt-4"> Confirm new password </form-label>
    <div class="flex items-end">
      <form-input
        v-model="confirmNewPassword"
        :type="showConfirmNewPw ? 'text' : 'password'"
        class="grow"
        :class="{
          'border-green-500': passwordsValid,
          'border-red-500': passwordError,
        }"
        required
        :disabled="updating"
        @blur="validatePasswordsMatch"
      />
      <GhostButton
        type="button"
        class="ml-1"
        @click="showConfirmNewPw = !showConfirmNewPw"
      >
        <EyeSlashIcon v-if="showConfirmNewPw" class="h-5 w-6" />
        <EyeIcon v-else class="h-5 w-6" />
      </GhostButton>
    </div>
    <p v-if="passwordError" class="text-red-500 font-semibold text-sm mt-1">
      {{ passwordError }}
    </p>
    <PrimaryButton :is-loading="updating" type="submit" class="mt-4">
      Update password
    </PrimaryButton>
  </form>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import { supabase } from "@/supabase";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import useToast from "./Toast/useToast";

const { showError, showSuccess } = useToast();

const newPassword = ref("");
const showNewPw = ref(false);
const confirmNewPassword = ref("");
const showConfirmNewPw = ref(false);
const passwordError = ref("");
const passwordsValid = ref(false);
const updating = ref(false);

function validatePasswordsMatch() {
  if (newPassword.value !== confirmNewPassword.value) {
    passwordError.value = "Passwords do no match";
    passwordsValid.value = false;
  } else {
    passwordError.value = "";
    passwordsValid.value = true;
  }
}

async function handleSubmit() {
  if (!passwordsValid.value) return;
  updating.value = true;
  try {
    await supabase.auth.updateUser({
      password: newPassword.value,
    });
    showSuccess({ message: "Password updated!" });
  } catch (error) {
    showError({ message: "Unable to update password" });
  } finally {
    updating.value = false;
  }
}
</script>
