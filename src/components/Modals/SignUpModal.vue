<template>
  <BaseModal title="One sec, let's make you an account" :open="open">
    <DismissButton
      v-if="allowDismiss"
      class="absolute top-4 right-4"
      label="Close"
      @click="emit('cancel')"
    />
    <SignUpForm
      v-if="showSignUpForm"
      :loading="loading"
      @sign-in="showSignUpForm = false"
      @sign-up-with-email="handleSignUp"
      @sign-up-with-google="signInWithGoogle"
    >
      <template #heading>
        <div />
      </template>
    </SignUpForm>
    <form
      v-else
      class="flex flex-col space-y-4 lg:max-w-xl mx-auto"
      @submit.prevent="handleLogin"
    >
      <LinkButton
        type="button"
        class="text-sm text-brand-500 mr-auto"
        @click="showSignUpForm = true"
      >
        Need an account? Sign up
      </LinkButton>
      <div class="flex flex-col mt-6">
        <form-label for="email"> Email </form-label>
        <form-input id="email" v-model="email" type="email" required />
      </div>
      <div class="flex flex-col mt-4">
        <form-label class="flex flex-col" for="password"> Password </form-label>
        <form-input id="password" v-model="password" type="password" required />
      </div>
      <primary-button :is-loading="loading" class="mt-4">
        Sign in
      </primary-button>
      <p class="text-xs text-slate-700 text-center my-4">OR</p>
      <div class="flex justify-center">
        <GoogleButton @click="signInWithGoogle" />
      </div>
    </form>
  </BaseModal>
</template>
<script setup lang="ts">
import { toRefs, ref } from "vue";
import BaseModal from "./BaseModal.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import SignUpForm from "@/components/SignUpForm.vue";
import GoogleButton from "@/components/Buttons/GoogleButton.vue";
import { supabase } from "@/supabase";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { store } from "@/store";
import DismissButton from "../Buttons/DismissButton.vue";
import { loadProfile } from "@/api/profiles";

const { showSuccess, showError } = useToast();

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  allowDismiss: {
    type: Boolean,
    default: true,
  },
});
toRefs(props);

const emit = defineEmits(["signedIn", "cancel"]);

const email = ref("");
const password = ref("");
const loading = ref(false);

const showSignUpForm = ref(true);

const handleSignUp = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    loading.value = true;
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (user) {
      store.user = await loadProfile(user.id);
      showSuccess({ message: "Account created" });
      emit("signedIn");
    }
  } catch (error) {
    showError({ message: error?.error_description || error?.message });
    log({ error });
  } finally {
    loading.value = false;
  }
};

const handleLogin = async () => {
  try {
    loading.value = true;
    const { user, error } = await supabase.auth.signIn({
      email: email.value,
      password: password.value,
    });
    if (user) {
      showSuccess({ message: "Signed in" });
      emit("signedIn");
    }
    if (error) throw error;
  } catch (error) {
    showError({ message: error?.error_description || error?.message });
    log({ error });
  } finally {
    loading.value = false;
  }
};

async function signInWithGoogle() {
  const { user, error } = await supabase.auth.signIn({
    provider: "google",
  });
  if (error) {
    log({ error });
    showError({ message: "Unable to sign in with Google" });
  }
  if (user) {
    store.user = user;
  }
}
</script>
