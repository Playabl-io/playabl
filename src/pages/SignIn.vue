<template>
  <BaseTemplate>
    <section>
      <p v-if="submitted" class="grid place-items-center text-xl font-bold">
        Awesome! Watch your email for a confirmation message very soon!
      </p>
      <div v-else-if="displaySignUp" class="lg:max-w-2xl mx-auto">
        <SignUpForm
          :loading="loading"
          @sign-in="displaySignUp = false"
          @sign-up-with-email="handleSignUp"
          @sign-up-with-google="signInWithGoogle"
        />
      </div>
      <form
        v-else
        class="flex flex-col lg:max-w-2xl mx-auto"
        @submit.prevent="handleLogin"
      >
        <Heading level="h1" as="h5" class="mb-3">Sign in</Heading>
        <BaseButton
          type="button"
          size="bare"
          class="text-blue-700 mr-auto"
          @click="displaySignUp = true"
        >
          Need an account? Sign up
        </BaseButton>
        <div class="flex justify-center mt-12">
          <GoogleButton @click="signInWithGoogle" />
        </div>
        <p class="text-xs text-slate-700 text-center my-4">OR</p>
        <div class="flex flex-col">
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
        <RouterLink
          to="/forgot-password"
          class="mt-2 text-sm text-slate-700 hover:underline"
        >
          Forgot password?
        </RouterLink>
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
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { useRouter, useRoute } from "vue-router";
import { store } from "@/store";
import GoogleButton from "@/components/Buttons/GoogleButton.vue";
import SignUpForm from "../components/SignUpForm.vue";
import BaseButton from "@/components/Buttons/BaseButton.vue";

const route = useRoute();
const router = useRouter();
const { showError } = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);
const submitted = ref(false);

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
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw new Error(error.message);
    if (user) {
      // makes sure other pages don't immediately redirect while App loads profile
      store.user = {
        id: user.id,
        email: user?.email || "",
        user_settings: {},
      };
    }
    const redirect = route.query.redirect;
    if (redirect && typeof redirect === "string") {
      router.push(redirect);
    } else {
      router.push("/");
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

async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  log({
    level: "info",
    message: `Provider info from Google: ${JSON.stringify(data.provider)}`,
  });
  if (error) {
    log({ error });
    showError({ message: "Unable to sign in with Google" });
  }
}
</script>
