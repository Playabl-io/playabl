<template>
  <BaseTemplate>
    <section>
      <p v-if="submitted" class="grid place-items-center text-xl font-bold">
        Awesome! Watch your email for a confirmation message very soon!
      </p>
      <SignUpForm
        v-else-if="displaySignUp"
        :loading="loading"
        @sign-in="displaySignUp = false"
        @sign-up-with-email="handleSignUp"
        @sign-up-with-google="signInWithGoogle"
      />
      <form
        v-else
        class="flex flex-col lg:max-w-xl mx-auto"
        @submit.prevent="handleLogin"
      >
        <Heading level="h1" as="h5">Sign in</Heading>
        <LinkButton
          type="button"
          class="text-sm text-brand-500 mr-auto mt-4"
          @click="displaySignUp = true"
        >
          Need an account? Sign up
        </LinkButton>
        <div class="flex flex-col mt-6">
          <form-label for="email"> Email </form-label>
          <form-input id="email" v-model="email" type="email" required />
        </div>
        <div class="flex flex-col mt-4">
          <form-label class="flex flex-col" for="password">
            Password
          </form-label>
          <form-input
            id="password"
            v-model="password"
            type="password"
            required
          />
        </div>
        <primary-button :is-loading="loading" class="mt-4">
          Sign in
        </primary-button>
        <p class="text-xs text-slate-700 text-center my-4">OR</p>
        <div class="flex justify-center">
          <GoogleButton @click="signInWithGoogle" />
        </div>
      </form>
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { ref } from "vue";
import { supabase } from "@/supabase";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { useRouter, useRoute } from "vue-router";
import { store } from "@/store";
import GoogleButton from "@/components/Buttons/GoogleButton.vue";
import SignUpForm from "../components/SignUpForm.vue";

const route = useRoute();
const router = useRouter();
const { showError } = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);
const submitted = ref(false);

// FOR BETA: DO NOT ALLOW SIGNING UP - ONLY SIGN IN
const displaySignUp = ref(false);

async function handleSignUp({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    submitted.value = true;
  } catch (error) {
    showError({ message: "Unable to sign in" });
    log({ error });
  } finally {
    loading.value = false;
  }
}

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
