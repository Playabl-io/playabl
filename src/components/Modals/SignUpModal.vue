<template>
  <BaseModal
    :title="showSignUpForm ? 'Create a new account' : 'Sign in to your account'"
    :open="open"
    @close="allowDismiss ? emit('cancel') : () => {}"
  >
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
      class="flex flex-col lg:max-w-2xl mx-auto"
      @submit.prevent="handleLogin"
    >
      <BaseButton
        type="button"
        size="bare"
        class="text-blue-700 mr-auto"
        @click="showSignUpForm = true"
      >
        Need an account? Sign up
      </BaseButton>
      <div class="flex justify-center mt-6">
        <GoogleButton @click="signInWithGoogle" />
      </div>
      <p class="text-xs text-slate-700 text-center my-4">OR</p>
      <div class="flex flex-col">
        <form-label for="email"> Email </form-label>
        <form-input id="email" v-model="email" type="email" required />
      </div>
      <div class="flex flex-col mt-4">
        <form-label class="flex flex-col" for="password"> Password </form-label>
        <div class="flex items-end gap-1">
          <form-input
            id="password"
            v-model="password"
            class="grow"
            :type="showPw ? 'text' : 'password'"
            required
          />
          <GhostButton type="button" class="ml-1" @click="showPw = !showPw">
            <EyeSlashIcon v-if="showPw" class="h-5 w-6" />
            <EyeIcon v-else class="h-5 w-6" />
          </GhostButton>
        </div>
      </div>
      <RouterLink
        to="/forgot-password"
        class="text-xs text-slate-700 mt-1 hover:text-blue-700"
      >
        Forgot password?
      </RouterLink>
      <primary-button :is-loading="loading" class="mt-4">
        Sign in
      </primary-button>
    </form>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref, PropType } from "vue";
import { supabase } from "@/supabase";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import BaseModal from "./BaseModal.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import SignUpForm from "@/components/SignUpForm.vue";
import GoogleButton from "@/components/Buttons/GoogleButton.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { store } from "@/store";
import DismissButton from "../Buttons/DismissButton.vue";
import { loadProfile } from "@/api/profiles";
import BaseButton from "../Buttons/BaseButton.vue";
import GhostButton from "../Buttons/GhostButton.vue";

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
  initialForm: {
    type: String as PropType<"sign-up" | "sign-in">,
    default: "sign-up",
  },
});

const emit = defineEmits(["signedIn", "cancel"]);

const showPw = ref(false);
const email = ref("");
const password = ref("");
const loading = ref(false);

const showSignUpForm = ref(props.initialForm === "sign-up");

const handleSignUp = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    loading.value = true;
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    if (user) {
      store.user = await loadProfile(user.id);
      showSuccess({ message: "Account created" });
      emit("signedIn");
    }
  } catch (error) {
    if (error instanceof Error) {
      showError({ message: error?.message });
    }
    log({ error });
  } finally {
    loading.value = false;
  }
};

const handleLogin = async () => {
  try {
    loading.value = true;
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (user) {
      showSuccess({ message: "Signed in" });
      emit("signedIn");
    }
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error) {
      showError({ message: error?.message });
    }
    log({ error });
  } finally {
    loading.value = false;
  }
};

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) {
    log({ error });
    showError({ message: "Unable to sign in with Google" });
  }
}
</script>
