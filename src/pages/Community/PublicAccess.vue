<template>
  <Heading level="h6" as="h2" class="mb-2">Public Access</Heading>
  <p class="text-sm text-slate-700 mb-2">
    Public access allows other to join from the listing page without any
    invitation or need to request membership.
  </p>
  <p class="text-sm text-slate-700 mb-2">
    Public access is currently
    <span class="font-bold">
      {{
        communityStore.community.allow_public_signup ? "enabled" : "disabled"
      }} </span
    >.
  </p>
  <p
    v-if="communityStore.community.join_payment_link_id"
    class="text-red-500 font-semibold my-2"
  >
    Enabling public access will disable your paid access
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
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { disablePaidAccess, updateStripePaymentLink } from "@/api/stripe";
import { setPublicAccess } from "@/api/communities";

const { showSuccess, showError } = useToast();

const isUpdating = ref(false);

async function togglePublicAccess() {
  try {
    isUpdating.value = true;
    const nextSetting = !communityStore.community.allow_public_signup;
    await setPublicAccess({
      enabled: nextSetting,
      communityId: communityStore.community.id,
    });
    if (
      nextSetting === true &&
      communityStore.community.join_payment_link_id &&
      communityStore.community.stripe_account_id
    ) {
      const results = await Promise.allSettled([
        updateStripePaymentLink({
          stripeAccountId: communityStore.community.stripe_account_id,
          paymentLinkId: communityStore.community.join_payment_link_id,
          update: {
            active: false,
          },
        }),
        disablePaidAccess({ communityId: communityStore.community.id }),
      ]);
      results.forEach((result) => {
        if (result.status === "rejected") {
          log({ message: result.reason });
        }
      });
      communityStore.community.join_payment_link = undefined;
      communityStore.community.join_payment_link_id = undefined;
      communityStore.community.join_price_id = undefined;
    }
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
