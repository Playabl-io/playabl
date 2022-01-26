<template>
  <router-view></router-view>
  <Toaster />
  <Modal title="Account created!" :open="displayFinishSignUp">
    <p class="prose prose-sm">
      Let's just get a couple of details to set up your profile
    </p>
    <form class="mt-2" @submit.prevent="updateProfile">
      <FormLabel class="flex flex-col">
        Display name
        <FormInput v-model="username" required />
      </FormLabel>
      <FormLabel class="mt-4 flex flex-col">
        Pronouns
        <FormInput v-model="pronouns" required />
      </FormLabel>
      <p class="prose prose-sm mt-2">
        You can change these, and other settings, any time from your profile
        page
      </p>
      <PrimaryButton :isLoading="saving" class="mt-4">
        Create profile
      </PrimaryButton>
    </form>
  </Modal>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { store } from "./store";
import { supabase } from "./supabase";
import Modal from "./components/Modal.vue";
import FormLabel from "./components/Forms/FormLabel.vue";
import FormInput from "./components/Forms/FormInput.vue";
import PrimaryButton from "./components/Buttons/PrimaryButton.vue";
import { log } from "./util/logger";
import { User } from "@supabase/supabase-js";
import Toaster from "./components/Toast/Toaster.vue";

const displayFinishSignUp = ref(false);
const username = ref("");
const pronouns = ref("");
const saving = ref(false);

const user = supabase.auth.user();

if (user) {
  store.user = user;
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session !== null && session.user) {
    store.user = session.user;
    checkForProfile(session.user);
  }
  if (event === "SIGNED_OUT") {
    store.user = null;
  }
});

async function checkForProfile(sessionUser: User) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", sessionUser.id)
    .single();
  if (!data) {
    displayFinishSignUp.value = true;
  }
}

async function updateProfile() {
  saving.value = true;

  const updates = {
    id: store.user?.id,
    username: username.value,
    pronouns: pronouns.value,
    updated_at: new Date(),
  };

  const { error } = await supabase.from("profiles").upsert(updates, {
    returning: "minimal", // Don't return the value after inserting
  });

  if (error) log(error);
  saving.value = false;
  displayFinishSignUp.value = false;
}
</script>
