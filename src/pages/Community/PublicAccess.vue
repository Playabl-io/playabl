<template>
  <Heading level="h6" as="h2" class="mb-2">Public Access</Heading>
  <p class="text-sm text-slate-700 mb-2">
    Public access allows other to join from the listing page without any
    invitation or need to request membership.
    <br />
    Public access is currently
    <span class="font-bold">
      {{
        communityStore.community.allow_public_signup ? "enabled" : "disabled"
      }} </span
    >.
  </p>

  <component
    :is="
      communityStore.community.allow_public_signup
        ? OutlineButton
        : PrimaryButton
    "
    class="w-full"
    :is-loading="isUpdating"
    @click="togglePublicAccess"
  >
    {{ communityStore.community.allow_public_signup ? "Disable" : "Enable" }}
  </component>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { communityStore } from "./communityStore";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import { supabase } from "@/supabase";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";

const { showSuccess, showError } = useToast();

const isUpdating = ref(false);

async function togglePublicAccess() {
  try {
    isUpdating.value = true;
    const nextSetting = !communityStore.community.allow_public_signup;
    await supabase
      .from("communities")
      .update(
        {
          allow_public_signup: nextSetting,
        },
        { returning: "minimal" }
      )
      .eq("id", communityStore.community.id);
    communityStore.community.allow_public_signup = nextSetting;
    showSuccess({ message: "Public access setting updated" });
  } catch (error) {
    log({ error });
    showError({ message: "Unable to update public access setting" });
  } finally {
    isUpdating.value = false;
  }
}
</script>
