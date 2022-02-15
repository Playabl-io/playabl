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
            <div class="flex items-end">
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
            <div class="flex items-end">
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
          </form-label>
          <p
            v-if="passwordError"
            class="text-red-500 font-semibold text-sm mt-1"
          >
            {{ passwordError }}
          </p>
        </div>
        <primary-button :is-loading="loading"> Sign up </primary-button>
        <LinkButton type="button" @click="displaySignUp = false">
          Have an account already? Sign in
        </LinkButton>
      </form>
      <form
        v-else
        class="flex flex-col space-y-4 lg:max-w-xl mx-auto"
        @submit.prevent="handleLogin"
      >
        <Heading level="h1" as="h5">Sign in</Heading>
        <form-label class="flex flex-col" for="email">
          Email
          <form-input id="email" v-model="email" type="email" required />
        </form-label>
        <form-label class="flex flex-col" for="password">
          Password
          <form-input
            id="password"
            v-model="password"
            type="password"
            required
          />
        </form-label>
        <primary-button :is-loading="loading"> Sign in </primary-button>

        <!-- BLOCKED FOR BETA
        <LinkButton type="button" @click="displaySignUp = true">
          Need an account? Sign up
        </LinkButton> -->
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
import { store } from "@/store";

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

// FOR BETA: DO NOT ALLOW SIGNING UP - ONLY SIGN IN
const displaySignUp = ref(false);

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
    const { user, error } = await supabase.auth.signIn({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    // makes sure other pages don't immediately redirect while App loads profile
    store.user = user;
    const redirect = route.query.redirect;
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
