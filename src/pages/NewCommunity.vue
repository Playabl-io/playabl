<template>
  <BaseTemplate>
    <div v-if="state.value === 'screen1'">
      <form
        class="max-w-2xl mx-auto flex flex-col"
        @submit.prevent="send('ADVANCE')"
      >
        <p class="prose prose-lg mb-12">Tell us about your community</p>
        <div class="grid grid-cols-1 gap-8">
          <div class="flex flex-col space-y-2">
            <FormLabel for="name">
              Name
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
          <div class="flex flex-col space-y-2">
            <FormLabel for="coverImage">Cover Image</FormLabel>
            <FormInput v-model="coverImage" id="coverImage" />
          </div>
        </div>
        <OutlineButton class="mt-8">
          Next <ArrowSmRightIcon class="h-6 w-6" />
        </OutlineButton>
      </form>
    </div>
    <div v-if="state.value === 'screen2'">
      <form
        class="max-w-2xl mx-auto flex flex-col"
        @submit.prevent="console.log('hey')"
      >
        <p class="prose prose-lg mb-12">Any links to share?</p>
        <div class="grid grid-cols-1 gap-8">
          <div class="flex flex-col space-y-2">
            <div class="flex flex-col space-y-2">
              <FormLabel for="website">Website</FormLabel>
              <FormInput v-model="website" id="website" type="url" />
            </div>
            <FormLabel for="twitter">
              Twitter
              <span role="presentation" class="text-red-700">*</span>
            </FormLabel>
            <FormInput v-model="twitter" id="twitter" />
          </div>
          <div class="flex flex-col space-y-2">
            <FormLabel for="facebook">Facebook</FormLabel>
            <FormInput v-model="facebook" id="facebook" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 max-w-2xl">
          <OutlineButton @click="send('BACK')" type="button" class="mt-8">
            <ArrowSmLeftIcon class="h-6 w-6" /> Back
          </OutlineButton>
          <PrimaryButton class="mt-8"> Create </PrimaryButton>
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

const newCommunityMachine = createMachine({
  id: "newCommunity",
  initial: "screen1",
  states: {
    screen1: {
      on: { ADVANCE: "screen2" },
    },
    screen2: {
      on: { BACK: "screen1" },
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
</script>
