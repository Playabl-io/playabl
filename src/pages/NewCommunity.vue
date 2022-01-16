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
          <div class="flex flex-col space-y-2">
            <FormLabel for="name">
              Community Name
              <span role="presentation" class="text-red-700">*</span>
            </FormLabel>
            <FormInput v-model="name" id="name" required />
            <p class="prose-sm">
              Your community name must be unique and cannot be changed
            </p>
          </div>
          <div class="flex flex-col space-y-2">
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
          <div class="flex flex-col space-y-2">
            <FormLabel for="website">Website</FormLabel>
            <FormInput v-model="website" id="website" type="url" />
          </div>
          <div class="flex flex-col space-y-2">
            <FormLabel for="twitter"> Twitter </FormLabel>
            <FormInput v-model="twitter" id="twitter" />
          </div>
          <div class="flex flex-col space-y-2">
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
    <div v-if="state.value === 'finished'">
      <Heading level="h2">Success!</Heading>
      <p class="prose prose-lg dark:prose-invert">
        Your community has been created. You will be redirected to complete
        setup.
      </p>
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
import Heading from "@/components/Heading.vue";

const newCommunityMachine = createMachine({
  id: "newCommunity",
  initial: "screen1",
  states: {
    screen1: {
      on: { ADVANCE: "screen2" },
    },
    screen2: {
      on: { BACK: "screen1", SUBMIT: "submitting" },
    },
    submitting: {
      on: {
        SUCCESS: "finished",
      },
    },
    finished: {
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

const isSubmitting = ref(false);
async function createCommunity() {
  send("SUBMIT");
  const { data, error } = await supabase.from("communities").insert({
    name: name.value,
    description: description.value,
    website: website.value,
    twitter: twitter.value,
    facebook: facebook.value,
  });
  if (error) {
    log({ error });
  }
  if (data) {
    send("SUCCESS");
  }
}
</script>
