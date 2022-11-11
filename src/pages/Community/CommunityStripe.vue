<template>
  <div class="flex justify-between items-center mb-4">
    <Heading as="h2" level="h6">Payment Settings</Heading>
    <span
      v-if="communityStore.community.join_payment_link_id"
      class="ml-px px-2 bg-green-200 rounded-2xl font-semibold text-green-900"
      >Active</span
    >
    <span
      v-else
      class="px-2 py-1 bg-rose-200 rounded-2xl font-semibold text-rose-900"
      >Inactive</span
    >
  </div>
  <div v-if="loading">
    <LoadingSpinner color="brand-500" />
  </div>
  <BaseButton
    v-if="setupState === 'incomplete'"
    class="text-white font-semibold bg-gradient-to-br from-fuchsia-600 to-brand-500 shadow-lg"
    @click="initiateFinishingSetup"
  >
    <svg
      v-if="gettingUrl"
      class="animate-spin w-5 h-5 mr-3 text-white"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    Finish setting up your Stripe account to accept payments
  </BaseButton>
  <BaseButton
    v-if="setupState === 'none'"
    class="text-white font-semibold bg-gradient-to-br from-fuchsia-600 to-brand-500 shadow-lg"
    @click="startStripeSetup"
  >
    <svg
      v-if="gettingUrl"
      class="animate-spin w-5 h-5 mr-3 text-white"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <template v-else>
      Activate your community platform in Stripe to collect payments
    </template>
  </BaseButton>
  <div v-if="setupState === 'complete'">
    <TabGroup>
      <TabList class="flex gap-4">
        <Tab v-slot="{ selected }" as="template">
          <button
            class="border-b border-solid"
            :class="{
              ' border-brand-500': selected,
              'border-transparent': !selected,
            }"
          >
            Community Access
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button
            class="border-b border-solid"
            :class="{
              ' border-brand-500': selected,
              'border-transparent': !selected,
            }"
          >
            Ticketed Games
          </button>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel class="pt-4">
          <div class="mb-6 text-sm text-slate-700">
            <p>Collect payment for membership and manage associated access.</p>
          </div>
          <StripePrices
            :stripe-account-id="stripeAccountId"
            :account-prices="communityStore.prices ?? []"
          />
        </TabPanel>
        <TabPanel class="pt-4">Game price settings</TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BaseButton from "@/components/Buttons/BaseButton.vue";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import { communityStore } from "./communityStore";
import {
  checkStripeSetup,
  createStripeAccount,
  finishStripeSetup,
  getStripePaymentLink,
  getStripePrices,
} from "@/api/stripe";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import useToast from "@/components/Toast/useToast";
import Heading from "@/components/Heading.vue";
import StripePrices from "./StripePrices.vue";

const { showError } = useToast();
const route = useRoute();

const loading = ref(true);
const gettingUrl = ref(false);
const setupState = ref<"unknown" | "none" | "incomplete" | "complete">(
  "unknown"
);

const stripeAccountId = communityStore.community.stripe_account_id || "";

onMounted(async () => {
  if (route.name === "Reauth") {
    initiateFinishingSetup();
  }
  if (!communityStore.community.stripe_account_id) {
    setupState.value = "none";
  }
  if (communityStore.community.stripe_account_id) {
    const data = await checkStripeSetup(
      communityStore.community.stripe_account_id
    );
    if (data.setup_complete) {
      const stripeAccountId = communityStore.community.stripe_account_id;
      await Promise.allSettled([
        loadPrices(stripeAccountId),
        loadPaymentLink(
          stripeAccountId,
          communityStore.community.join_payment_link_id
        ),
      ]);
    }
    setupState.value = data.setup_complete ? "complete" : "incomplete";
  }
  loading.value = false;
});

async function startStripeSetup() {
  gettingUrl.value = true;
  try {
    const data = await createStripeAccount(communityStore.community.id);
    window.open(data.redirect_url);
  } catch (error) {
    showError({
      message:
        "Unable to generate a signup link. Please try again, or contact support",
    });
  } finally {
    gettingUrl.value = false;
  }
}

async function initiateFinishingSetup() {
  if (!communityStore.community.stripe_account_id) return;

  gettingUrl.value = true;
  try {
    const data = await finishStripeSetup({
      communityId: communityStore.community.id,
      stripeAccountId: communityStore.community.stripe_account_id,
    });
    window.open(data.redirect_url);
  } catch (error) {
    showError({
      message:
        "Unable to generate a signup link. Please try again, or contact support",
    });
  } finally {
    gettingUrl.value = false;
  }
}

async function loadPrices(accountId: string) {
  const prices = await getStripePrices(accountId);
  communityStore.prices = prices.data;
}

async function loadPaymentLink(accountId: string, paymentLinkId?: string) {
  if (!paymentLinkId) return;
  const paymentLink = await getStripePaymentLink({
    stripeAccountId: accountId,
    paymentLinkId,
  });
  communityStore.paymentLink = paymentLink;
}
</script>
