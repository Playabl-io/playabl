<template>
  <BaseTemplate>
    <div v-if="state.value === 'screen1'">
      <form
        class="max-w-2xl mx-auto flex flex-col"
        @submit.prevent="send('ADVANCE')"
      >
        <p class="prose dark:prose-invert prose-lg mb-12">
          Tell us about your community
        </p>
        <div class="grid grid-cols-1 gap-8">
          <div class="flex flex-col">
            <FormLabel for="name" required> Community Name </FormLabel>
            <FormInput v-model="name" id="name" required />
            <p class="prose dark:prose-invert text-xs leading-6">
              Your community name must be unique and cannot be changed
            </p>
          </div>
          <div class="flex flex-col">
            <FormLabel for="description">Description</FormLabel>
            <FormTextArea v-model="description" id="description" />
          </div>
        </div>
        <OutlineButton class="mt-8 font-semibold">
          Next <ArrowSmRightIcon class="h-6 w-6" />
        </OutlineButton>
      </form>
    </div>
    <div v-if="['screen2', 'submitting'].includes(state.value as string)">
      <form
        class="max-w-2xl mx-auto flex flex-col"
        @submit.prevent="createCommunity"
      >
        <p class="prose dark:prose-invert prose-lg mb-12">
          Any links to share?
        </p>
        <div class="grid grid-cols-1 gap-8">
          <div class="flex flex-col">
            <FormLabel for="website">Website</FormLabel>
            <FormInput v-model="website" id="website" type="url" />
          </div>
          <div class="flex flex-col">
            <FormLabel for="twitter"> Twitter </FormLabel>
            <FormInput v-model="twitter" id="twitter" />
          </div>
          <div class="flex flex-col">
            <FormLabel for="facebook">Facebook</FormLabel>
            <FormInput v-model="facebook" id="facebook" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 max-w-2xl">
          <OutlineButton
            @click="send('BACK')"
            type="button"
            class="mt-8 font-semibold"
          >
            <ArrowSmLeftIcon class="h-6 w-6" /> Back
          </OutlineButton>
          <PrimaryButton class="mt-8" :isLoading="state.value === 'submitting'">
            Create
          </PrimaryButton>
        </div>
      </form>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useMachine } from "@xstate/vue";
import { createMachine } from "xstate";
import BaseTemplate from "@/components/BaseTemplate.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import { ArrowSmRightIcon, ArrowSmLeftIcon } from "@heroicons/vue/solid";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { store } from "@/store";
import router from "@/router";
import {
  AccessLevel,
  ACCESS_LEVEL_TIME_DENOMINATION,
} from "@/typings/AccessLevel";
import { ADMIN } from "@/util/roles";

const newCommunityMachine = createMachine({
  id: "newCommunity",
  initial: "screen1",
  states: {
    screen1: {
      on: { ADVANCE: "screen2" },
    },
    screen2: {
      on: { BACK: "screen1", SUBMIT: "submitting", NO_USER: "show_signup" },
    },
    submitting: {
      type: "final",
    },
    show_signup: {
      type: "final",
    },
  },
});
const { state, send } = useMachine(newCommunityMachine);

const name = ref("");
const description = ref("");
const coverImage = ref("");
const website = ref("");
const twitter = ref("");
const facebook = ref("");

async function createCommunity() {
  if (!store.user) {
    send("NO_USER");
    return;
  }
  send("SUBMIT");
  try {
    const { data, error } = await supabase
      .from("communities")
      .insert({
        name: name.value,
        description: description.value,
        website: website.value,
        twitter: twitter.value,
        facebook: facebook.value,
        owner_id: store.user.id,
        allow_public_signup: false,
      })
      .single();
    if (error) throw error;

    // Create default access level
    const { data: accessLevelData, error: accessLevelError } = await supabase
      .from<AccessLevel>("access_levels")
      .insert({
        name: "default",
        community_id: data.id,
        priority_access_time: 0,
        time_denomination: ACCESS_LEVEL_TIME_DENOMINATION.hours,
        is_mandatory: true,
      })
      .single();
    if (accessLevelError) throw accessLevelError;

    // Add owner to community membership
    const { error: membershipError } = await supabase
      .from("community_memberships")
      .insert({
        user_id: store.user.id,
        community_id: data.id,
        role_id: ADMIN,
      });
    if (membershipError) throw membershipError;

    // Add community access
    const { error: accessError } = await supabase
      .from("community_access")
      .insert({
        user_id: store.user.id,
        community_id: data.id,
        access_level_id: accessLevelData?.id,
      });
    if (accessError) throw accessError;

    router.push(`/communities/${data.id}/manage?display_success_banner=true`);
  } catch (error) {
    log({ error });
  }
}
</script>
