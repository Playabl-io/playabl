<template>
  <Heading level="h6" as="h2" class="mb-2">Community Sign Up</Heading>
  <p class="text-slate-700 mb-2">
    Select how others can sign up for the community.
  </p>
  <ul class="text-sm list-inside list-disc mb-4 flex flex-col gap-2">
    <li>
      Public allows other to join from the listing page without any invitation
      or need to request membership
    </li>
    <li>
      Requested allows others to submit a request for membership which you can
      then approve or deny
    </li>
    <li>Private only allows people to join via invite link</li>
  </ul>
  <p class="text-sm text-slate-700 mb-2">
    Current sign up method:
    <span class="font-bold">
      {{ communityStore.community.signup_method.toLocaleLowerCase() }} </span
    >.
  </p>
  <LoadingSpinner v-if="isUpdating" color="brand-500" />
  <FormSelect
    v-else
    :model-value="communityStore.community.signup_method"
    @update:model-value="handleSignupMethodChange"
  >
    <option
      :selected="communityStore.community.signup_method === 'PUBLIC'"
      value="PUBLIC"
    >
      Public
    </option>
    <option
      :selected="communityStore.community.signup_method === 'REQUEST'"
      value="REQUEST"
    >
      Request
    </option>
    <option
      :selected="communityStore.community.signup_method === 'PRIVATE'"
      value="PRIVATE"
    >
      Private
    </option>
  </FormSelect>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Heading from "@/components/Heading.vue";
import { communityStore } from "./communityStore";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { setSignupMethod } from "@/api/communities";
import FormSelect from "@/components/Forms/FormSelect.vue";
import { Community } from "@/typings/Community";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const { showSuccess, showError } = useToast();

const isUpdating = ref(false);

async function handleSignupMethodChange(value: Community["signup_method"]) {
  try {
    await setSignupMethod({
      signupMethod: value,
      communityId: communityStore.community.id,
    });
    communityStore.community.signup_method = value;
    showSuccess({ message: "Sign up setting updated" });
  } catch (error) {
    log({ error });
    showError({ message: "Unable to update sign up setting" });
  } finally {
    isUpdating.value = false;
  }
}
</script>
