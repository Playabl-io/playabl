<template>
  <BaseTemplate>
    <section>
      <p v-if="submitted" class="grid place-items-center text-xl font-bold">
        Awesome! Watch your email for a confirmation message very soon!
      </p>
      <form
        v-else-if="displaySignUp"
        class="flex flex-col space-y-4 lg:max-w-xl mx-auto"
        @submit.prevent="handleSignUp"
      >
        <Heading level="h1" as="h5">Sign up</Heading>
        <p class="prose dark:prose-invert">
          Sign up to join or start communities and play in games
        </p>
        <form-label class="flex flex-col">
          Email
          <form-input v-model="email" type="email" required />
        </form-label>
        <div>
          <form-label class="flex flex-col">
            Password
            <div class="flex">
              <form-input
                class="grow"
                :class="{
                  'border-green-500': passwordsValid,
                  'border-red-500': passwordError,
                }"
                v-model="password"
                :type="showPw ? 'text' : 'password'"
                required
              />
              <GhostButton type="button" @click="showPw = !showPw" class="ml-1">
                <EyeOffIcon v-if="showPw" class="h-5 w-6" />
                <EyeIcon v-else class="h-5 w-6" />
              </GhostButton>
            </div>
          </form-label>
          <p
            v-if="passwordError"
            class="text-red-500 text-sm font-semibold mt-1"
          >
            {{ passwordError }}
          </p>
        </div>
        <div>
          <form-label class="flex flex-col">
            Confirm password
            <dev class="flex">
              <form-input
                v-model="confirmPassword"
                :type="showConfirmPw ? 'text' : 'password'"
                class="grow"
                :class="{
                  'border-green-500': passwordsValid,
                  'border-red-500': passwordError,
                }"
                @blur="validatePasswordsMatch"
                required
              />
              <GhostButton
                type="button"
                @click="showConfirmPw = !showConfirmPw"
                class="ml-1"
              >
                <EyeOffIcon v-if="showConfirmPw" class="h-5 w-6" />
                <EyeIcon v-else class="h-5 w-6" />
              </GhostButton>
            </dev>
          </form-label>
          <p
            v-if="passwordError"
            class="text-red-500 font-semibold text-sm mt-1"
          >
            {{ passwordError }}
          </p>
        </div>
        <primary-button :isLoading="loading"> Sign up </primary-button>
        <LinkButton @click="displaySignUp = false" type="button">
          Have an account already? Sign in
        </LinkButton>
      </form>
      <form
        v-else
        class="flex flex-col space-y-4 lg:max-w-xl mx-auto"
        @submit.prevent="handleLogin"
      >
        <Heading level="h1" as="h5">Sign in</Heading>
        <form-label class="flex flex-col">
          Email
          <form-input v-model="email" type="email" required />
        </form-label>
        <form-label class="flex flex-col">
          Password
          <form-input v-model="password" type="password" required />
        </form-label>
        <primary-button :isLoading="loading"> Sign in </primary-button>
        <LinkButton @click="displaySignUp = true" type="button">
          Need an account? Sign up.
        </LinkButton>
      </form>
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { ref } from "vue";
import { supabase } from "@/supabase";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { useRouter, useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();
const { showError } = useToast();

const email = ref("");
const password = ref("");
const showPw = ref(false);
const confirmPassword = ref("");
const showConfirmPw = ref(false);
const passwordError = ref("");
const passwordsValid = ref(false);
const loading = ref(false);
const submitted = ref(false);

const displaySignUp = ref(true);

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
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    submitted.value = true;
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
    const { error } = await supabase.auth.signIn({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    const redirect = route.query.redirect;
    console.log(redirect);
    if (redirect && typeof redirect === "string") {
      router.push(redirect);
    } else {
      router.push("/profile");
    }
  } catch (error) {
    showError({ message: error?.error_description || error?.message });
    log({ error });
  } finally {
    loading.value = false;
  }
};
</script>
