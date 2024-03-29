<template>
  <ProfileTemplate>
    <section class="flex flex-col">
      <Heading level="h1" as="h1" class="text-right">Update your info</Heading>
      <hr class="my-10" />
      <form @submit.prevent="updateProfile">
        <fieldset class="flex flex-col gap-8" :disabled="loading">
          <div class="flex flex-col">
            <FormLabel for="display-name">Display name</FormLabel>
            <FormInput id="display-name" v-model="username" />
          </div>
          <div class="flex flex-col">
            <FormLabel for="display-name">Email</FormLabel>
            <FormInput id="display-name" v-model="email" />
          </div>
          <div class="flex flex-col">
            <FormLabel for="pronouns">Pronouns</FormLabel>
            <FormInput id="pronouns" v-model="pronouns" />
          </div>
          <div class="flex flex-col">
            <FormLabel for="website">Website</FormLabel>
            <FormInput id="website" v-model="website" />
          </div>
          <div class="flex flex-col">
            <FormLabel for="twitter"> Twitter handle </FormLabel>
            <div class="relative flex items-center">
              <AtSymbolIcon class="h-6 w-6 absolute left-2" />
              <FormInput id="twitter" v-model="twitter" class="pl-10 grow" />
            </div>
          </div>
          <div class="flex flex-col">
            <FormLabel for="bio">Bio</FormLabel>
            <FormTextArea id="bio" v-model="bio" rows="6" />
          </div>
          <div class="flex justify-end">
            <PrimaryButton :is-loading="loading">Update</PrimaryButton>
          </div>
          <InfoBanner
            v-if="showConfirmEmailBanner"
            @dismiss="showConfirmEmailBanner = false"
          >
            <p>
              Email change registered. Please confirm by following the link sent
              to the new email.
            </p>
          </InfoBanner>
        </fieldset>
      </form>
    </section>
  </ProfileTemplate>
</template>

<script setup lang="ts">
import { supabase } from "../../supabase";
import { store } from "../../store";
import { ref, watch } from "vue";
import ProfileTemplate from "@/layouts/ProfileTemplate.vue";
import Heading from "@/components/Heading.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import { AtSymbolIcon } from "@heroicons/vue/24/outline";
import { log } from "@/util/logger";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import useToast from "@/components/Toast/useToast";
import InfoBanner from "@/components/Banners/InfoBanner.vue";

const { showSuccess, showError } = useToast();

const loading = ref(false);
const username = ref(store.user?.username);
const pronouns = ref(store.user?.pronouns);
const website = ref(store.user?.website);
const twitter = ref(store.user?.twitter);
const bio = ref(store.user?.bio);
const email = ref(store.user?.email);

const showConfirmEmailBanner = ref(false);

watch(
  () => store.user,
  (updated) => {
    username.value = updated?.username;
    pronouns.value = updated?.pronouns;
    website.value = updated?.website;
    twitter.value = updated?.twitter;
    bio.value = updated?.bio;
  }
);

async function updateProfile() {
  function isDefinedAndNoMatch(a: string, b?: string) {
    if (b) {
      return a !== b;
    }
    return false;
  }

  if (!store.user?.id) return;
  loading.value = true;
  try {
    const emailsDontMatch =
      email.value !== store.user.email ||
      isDefinedAndNoMatch(email.value, store.userSession?.user.email) ||
      isDefinedAndNoMatch(email.value, store.userSession?.user.new_email);
    if (emailsDontMatch) {
      const { error } = await supabase.auth.updateUser({
        email: email.value,
      });
      console.error(error);
      if (error) throw error;
      showConfirmEmailBanner.value = true;
    }
    const updates = {
      username: username.value,
      pronouns: pronouns.value,
      updated_at: new Date(),
      website: website.value,
      twitter: twitter.value,
      bio: bio.value,
      email: email.value,
    };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", store.user.id);
    if (error) throw error;
    showSuccess({ message: "Info updated" });
  } catch (error) {
    log({ error });
    showError({ message: "Something went wrong" });
  } finally {
    loading.value = false;
  }
}
</script>
