<template>
  <Modal title="One sec, let's make you an account" :open="open">
    <DismissButton
      v-if="allowDismiss"
      class="absolute top-4 right-4"
      label="Close"
      @click="emit('cancel')"
    />
    <div class="my-12">
      <form
        v-if="showSignUpForm"
        class="flex flex-col space-y-4 lg:max-w-xl mx-auto"
        @submit.prevent="handleSignUp"
      >
        <div class="flex flex-col">
          <form-label> Email </form-label>
          <form-input v-model="email" type="email" required />
        </div>
        <div>
          <div class="flex flex-col">
            <form-label> Password </form-label>
            <div class="flex">
              <form-input
                v-model="password"
                class="grow"
                :class="{
                  'border-green-500': passwordsValid,
                  'border-red-500': passwordError,
                }"
                :type="showPw ? 'text' : 'password'"
                required
              />
              <GhostButton type="button" class="ml-1" @click="showPw = !showPw">
                <EyeOffIcon v-if="showPw" class="h-5 w-6" />
                <EyeIcon v-else class="h-5 w-6" />
              </GhostButton>
            </div>
          </div>
          <p
            v-if="passwordError"
            class="text-red-500 text-sm font-semibold mt-1"
          >
            {{ passwordError }}
          </p>
        </div>
        <div>
          <div class="flex flex-col">
            <form-label> Confirm password </form-label>
            <div class="flex">
              <form-input
                v-model="confirmPassword"
                :type="showConfirmPw ? 'text' : 'password'"
                class="grow"
                :class="{
                  'border-green-500': passwordsValid,
                  'border-red-500': passwordError,
                }"
                required
                @blur="validatePasswordsMatch"
              />
              <GhostButton
                type="button"
                class="ml-1"
                @click="showConfirmPw = !showConfirmPw"
              >
                <EyeOffIcon v-if="showConfirmPw" class="h-5 w-6" />
                <EyeIcon v-else class="h-5 w-6" />
              </GhostButton>
            </div>
          </div>
          <p
            v-if="passwordError"
            class="text-red-500 font-semibold text-sm mt-1"
          >
            {{ passwordError }}
          </p>
        </div>
        <primary-button :is-loading="loading"> Sign up </primary-button>
        <LinkButton type="button" @click="showSignUpForm = false">
          Have an account already? Sign in
        </LinkButton>
      </form>
      <form
        v-else
        class="flex flex-col space-y-4 lg:max-w-xl mx-auto"
        @submit.prevent="handleLogin"
      >
        <form-label class="flex flex-col">
          Email
          <form-input v-model="email" type="email" required />
        </form-label>
        <form-label class="flex flex-col">
          Password
          <form-input v-model="password" type="password" required />
        </form-label>
        <primary-button :is-loading="loading"> Sign in </primary-button>
        <LinkButton type="button" @click="showSignUpForm = true">
          Need an account? Sign up
        </LinkButton>
      </form>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { toRefs, ref } from "vue";
import Modal from "./Modal.vue";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { supabase } from "@/supabase";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
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
const showPw = ref(false);
const confirmPassword = ref("");
const showConfirmPw = ref(false);
const passwordError = ref("");
const passwordsValid = ref(false);
const loading = ref(false);

const showSignUpForm = ref(true);

function validatePasswordsMatch() {
  if (password.value !== confirmPassword.value) {
    passwordError.value = "Passwords do no match";
    passwordsValid.value = false;
  } else {
    passwordError.value = "";
    passwordsValid.value = true;
  }
}

const handleSignUp = async () => {
  try {
    loading.value = true;
    const { user, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
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
</script>
