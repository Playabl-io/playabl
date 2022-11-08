<template>
  <LoadingSpinner color="brand-500" />
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { communityStore } from "./communityStore";
import { finishStripeSetup } from "@/api/stripe";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";

const { showError } = useToast();

onMounted(async () => {
  if (!communityStore.community.stripe_account_id) {
    throw new Error("no stripe account");
  }
  try {
    const data = await finishStripeSetup({
      communityId: communityStore.community.id,
      stripeAccountId: communityStore.community.stripe_account_id,
    });
    window.open(data.redirect_url);
  } catch (error) {
    log({ error });
    showError({
      message: "Unable to open stripe. Please contact support.",
    });
  }
});
</script>
