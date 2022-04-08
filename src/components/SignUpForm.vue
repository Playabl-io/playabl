<template>
  <form
    class="flex flex-col lg:max-w-xl mx-auto"
    @submit.prevent="handleSubmit"
  >
    <slot name="heading">
      <Heading level="h1" as="h5" class="mb-4">Sign up</Heading>
    </slot>
    <p class="text-sm font-medium">
      Sign up to join or start communities and play in games
    </p>
    <LinkButton
      type="button"
      class="mr-auto mt-1 text-sm text-brand-500"
      @click="emit('signIn')"
    >
      Have an account already? Sign in
    </LinkButton>
    <form-label class="flex flex-col mt-6"> Email </form-label>
    <form-input v-model="email" type="email" required />
    <Popover class="relative">
      <PopoverButton
        type="button"
        class="flex items-center gap-1 mr-auto mt-1 rounded-md hover:underline focus-styles"
      >
        <InformationCircleIcon class="w-4 h-4" />
        <p class="text-xs text-slate-700">How will my email be used?</p>
      </PopoverButton>

      <PopoverPanel
        class="absolute z-10 mt-2 bg-white p-4 rounded-md shadow-md border border-solid border-gray-100"
      >
        <p class="text-sm leading-relaxed">
          Your email is used to notify you when RSVP status for games change,
          and is made available to the game facilitators and community
          administrators you join. You should sign up with a public email.
        </p>
      </PopoverPanel>
    </Popover>
    <transition
      enter-active-class="transition duration-700 ease-out"
      enter-from-class="transform opacity-0"
      enter-to-class="transform opacity-100"
      leave-active-class="transition duration-300 ease-out"
      leave-from-class="transform opacity-100"
      leave-to-class="transform opacity-0"
    >
      <div v-if="email" class="mt-4">
        <form-label class="flex flex-col"> Password </form-label>
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
        <p v-if="passwordError" class="text-red-500 text-sm font-semibold mt-1">
          {{ passwordError }}
        </p>
        <form-label class="flex flex-col mt-4"> Confirm password </form-label>
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
        <p v-if="passwordError" class="text-red-500 font-semibold text-sm mt-1">
          {{ passwordError }}
        </p>
      </div>
    </transition>
    <div class="text-xs text-slate-700 mt-6">
      By signing up, you agree to the Playabl
      <router-link
        class="text-brand-500"
        to="/tos"
        target="_blank"
        rel="noreferrer noopener"
      >
        Terms of Service
      </router-link>
      and
      <router-link
        class="text-brand-500"
        to="/privacy"
        target="_blank"
        rel="noreferrer noopener"
      >
        Privacy Policy
      </router-link>
    </div>
    <primary-button :is-loading="loading" class="mt-2">
      Sign up
    </primary-button>
    <p class="text-xs text-slate-700 text-center my-4">OR</p>
    <div class="flex justify-center">
      <GoogleButton @click="emit('signUpWithGoogle')" />
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import {
  EyeIcon,
  EyeOffIcon,
  InformationCircleIcon,
} from "@heroicons/vue/outline";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import GoogleButton from "@/components/Buttons/GoogleButton.vue";

const emit = defineEmits(["signUpWithEmail", "signUpWithGoogle", "signIn"]);

defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
});

const email = ref("");
const password = ref("");
const showPw = ref(false);
const confirmPassword = ref("");
const showConfirmPw = ref(false);
const passwordError = ref("");
const passwordsValid = ref(false);

function validatePasswordsMatch() {
  if (password.value !== confirmPassword.value) {
    passwordError.value = "Passwords do no match";
    passwordsValid.value = false;
  } else {
    passwordError.value = "";
    passwordsValid.value = true;
  }
}

function handleSubmit() {
  if (!passwordsValid.value) return;
  emit("signUpWithEmail", { email, password });
}
</script>
