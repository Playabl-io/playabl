<template>
  <!-- <template v-if="communityStore.paymentLink">
    <div
      class="bg-gray-200 p-2 font-mono rounded-md text-sm flex justify-between relative"
    >
      {{ communityStore.paymentLink }}
      <button @click="copy(communityStore.paymentLink)">
        <ClipboardIcon class="w-5 h-5 text-slate-700" />
      </button>
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-4 opacity-0"
        enter-to-class="transform opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform opacity-100"
        leave-to-class="transform translate-y-4 opacity-0"
      >
        <div
          v-if="copied"
          class="absolute translate-y-full z-10 p-3 bg-white -bottom-2 right-0 rounded-lg shadow-lg"
        >
          <p class="text-sm">Copied!</p>
        </div>
      </transition>
    </div>
    <p class="text-sm text-slate-700 mt-1 mb-6">
      This is your community sign up payment link. You can share this anywhere,
      and we'll grant the user access after they complete checkout.
    </p>
  </template> -->
  <p class="font-semibold mb-6 py-2 border-b border-solid border-gray-200">
    Price options
  </p>
  <div class="mb-12 relative">
    <div
      v-if="updatingPrice"
      class="absolute w-full h-full grid place-content-center z-10"
    >
      <LoadingSpinner color="brand-500" />
    </div>
    <div
      class="grid grid-cols-2 md:grid-cols-3 gap-4"
      :class="{ 'opacity-5': updatingPrice }"
    >
      <StripePriceItem
        v-for="price in accountPrices"
        :key="price.id"
        :price="price"
        :stripe-account-id="stripeAccountId"
        @set-active="setPriceAsActive(price.id)"
      />
    </div>
    <p v-if="accountPrices.length === 0" class="text-center col-span-full">
      No pricing options found.
      <a
        href="https://dashboard.stripe.com/products"
        target="blank"
        class="underline"
      >
        Make your first product in the Stripe dashboard
      </a>
      and then activate it here.
    </p>
  </div>
  <div
    class="flex justify-between items-center py-2 border-b border-solid border-gray-200 mb-6"
  >
    <p class="font-semibold">Access to assign on payment</p>
    <button @click="toggleAssignAccessLevelModal">
      <PencilSquareIcon class="h-6 w-6 text-slate-700" />
    </button>
  </div>
  <div class="flex flex-col gap-2 mb-12">
    <div
      v-for="accessLevel in assignedAccessLevels"
      :key="accessLevel.id"
      class="mb-4"
    >
      <p>
        {{ accessLevel.name }}
      </p>
      <p class="text-sm text-slate-700">
        {{ accessLevel.priority_access_time }}
        {{ accessLevel.time_denomination }}
      </p>
    </div>
    <p v-if="assignedAccessLevels.length === 0" class="text-center">
      No access levels assigned
    </p>
    <Tooltip>
      <template #trigger="{ toggleTooltip }">
        <p
          class="text-sm font-light flex items-center gap-1"
          @mouseenter="toggleTooltip"
          @mouseleave="toggleTooltip"
        >
          {{ accessLevelsByJoinSetting.standardOnJoinAccessLevels.length }}
          additional levels assigned automatically via access policies
          <InformationCircleIcon class="h-4 w-4" />
        </p>
      </template>
      <template #tooltip>
        <div
          v-for="accessLevel in accessLevelsByJoinSetting.standardOnJoinAccessLevels"
          :key="accessLevel.id"
          class="mb-3 last:mb-0"
        >
          <p>
            {{ accessLevel.name }}
          </p>
          <p class="text-sm text-slate-700">
            {{ accessLevel.priority_access_time }}
            {{ accessLevel.time_denomination }}
          </p>
        </div>
      </template>
    </Tooltip>
  </div>
  <BaseModal
    :open="assignAccessLevelModalOpen"
    title="Choose access levels"
    @close="toggleAssignAccessLevelModal"
  >
    <form class="flex flex-col gap-2" @submit.prevent="handleSaveAccessLevels">
      <p class="text-sm font-light flex items-center gap-1 mb-2">
        {{ accessLevelsByJoinSetting.standardOnJoinAccessLevels.length }}
        levels assigned automatically via access policies. You may choose
        additional policies to assign.
      </p>
      <div
        v-for="accessLevel in accessLevelsByJoinSetting.availableLevels"
        :key="accessLevel.id"
      >
        <FormLabel
          no-margin
          :for="accessLevel.id"
          class="flex items-center gap-2 font-normal"
        >
          <FormCheckbox
            :id="accessLevel.id"
            v-model="accessLevelsToAssign"
            :value="accessLevel.id"
          />
          {{ accessLevel.name }} ({{ accessLevel.priority_access_time }}
          {{ accessLevel.time_denomination }})
        </FormLabel>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <GhostButton type="button" @click="toggleAssignAccessLevelModal">
          Cancel
        </GhostButton>
        <PrimaryButton :is-loading="updatingPaymentLink">Save</PrimaryButton>
      </div>
    </form>
  </BaseModal>
</template>
<script lang="ts" setup>
import { PropType, ref, computed } from "vue";
import Stripe from "stripe";
import {
  PencilSquareIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";
import StripePriceItem from "./StripePriceItem.vue";
import BaseModal from "@/components/Modals/BaseModal.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { AccessLevel } from "@/typings/AccessLevel";
import { PaymentLinkTypes } from "@/typings/Stripe";
import { communityStore } from "./communityStore";
import useToast from "@/components/Toast/useToast";
import {
  createStripePaymentLink,
  setActiveJoinPrice,
  setJoinPaymentLink,
  updateStripePaymentLink,
} from "@/api/stripe";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Tooltip from "@/components/Tooltip.vue";
import { setPublicAccess } from "@/api/communities";

const { showSuccess, showError } = useToast();

const props = defineProps({
  stripeAccountId: {
    type: String,
    required: true,
  },
  accountPrices: {
    type: Array as PropType<Stripe.Price[]>,
    required: true,
  },
});

const assignedAccessLevelIds = computed(
  () =>
    JSON.parse(
      communityStore.paymentLink?.metadata?.access_levels ?? "[]"
    ) as number[]
);
const assignedAccessLevels = computed(() => {
  return communityStore.communityAccessLevels.filter((accessLevel) =>
    assignedAccessLevelIds.value.includes(accessLevel.id)
  );
});
const accessLevelsByJoinSetting = computed(() => {
  const result = communityStore.communityAccessLevels.reduce(
    (acc, cur) => {
      if (cur.apply_on_join) {
        acc.standardOnJoinAccessLevels.push(cur);
      } else {
        acc.availableLevels.push(cur);
      }
      return acc;
    },
    { standardOnJoinAccessLevels: [], availableLevels: [] } as {
      standardOnJoinAccessLevels: AccessLevel[];
      availableLevels: AccessLevel[];
    }
  );
  return result;
});

const assignAccessLevelModalOpen = ref(false);
const accessLevelsToAssign = ref<AccessLevel["id"][]>([]);
const updatingPrice = ref(false);
const updatingPaymentLink = ref(false);

function toggleAssignAccessLevelModal() {
  if (assignAccessLevelModalOpen.value) {
    accessLevelsToAssign.value = [];
  } else {
    accessLevelsToAssign.value = assignedAccessLevelIds.value;
  }
  assignAccessLevelModalOpen.value = !assignAccessLevelModalOpen.value;
}

async function setPriceAsActive(priceId: string) {
  updatingPrice.value = true;
  try {
    await setActiveJoinPrice({
      communityId: communityStore.community.id,
      priceId,
    });
    communityStore.community.join_price_id = priceId;
    const paymentLinkId = communityStore.community.join_payment_link_id;
    if (!paymentLinkId) {
      await createPaymentLink(assignedAccessLevelIds.value);
    } else {
      await updatePaymentLink(assignedAccessLevelIds.value);
    }
    showSuccess({ message: "Sign up price updated!" });
  } catch (error) {
    showError({
      message: "Unable to update the active price. Please contact support.",
    });
  } finally {
    updatingPrice.value = false;
  }
}

async function handleSaveAccessLevels() {
  try {
    await updatePaymentLink(accessLevelsToAssign.value);
    toggleAssignAccessLevelModal();
    showSuccess({ message: "Paid access updated" });
  } catch (error) {
    showError({
      message: "Unable to update paid access. Please contact support.",
    });
  }
}

async function updatePaymentLink(accessLevels: number[]) {
  updatingPaymentLink.value = true;
  const stripeAccountId = communityStore.community.stripe_account_id;
  const paymentLinkId = communityStore.community.join_payment_link_id;
  const joinPriceId = communityStore.community.join_price_id;

  if (!stripeAccountId || !paymentLinkId || !joinPriceId) return;

  await updateStripePaymentLink({
    stripeAccountId,
    paymentLinkId,
    update: {
      active: false,
    },
  });
  await createPaymentLink(accessLevels);
  updatingPaymentLink.value = false;
}

async function createPaymentLink(accessLevels: number[]) {
  const priceId = communityStore.community.join_price_id;
  if (!priceId) return;
  const data = await createStripePaymentLink({
    priceId,
    stripeAccountId: props.stripeAccountId,
    metadata: {
      playabl_community_id: communityStore.community.id,
      payment_link_type: PaymentLinkTypes.community_join,
      access_levels: JSON.stringify(accessLevels),
    },
  });
  await setJoinPaymentLink({
    communityId: communityStore.community.id,
    paymentLink: data.url,
    paymentLinkId: data.id,
  });
  await setPublicAccess({
    enabled: false,
    communityId: communityStore.community.id,
  });
  communityStore.community.allow_public_signup = false;
  communityStore.paymentLink = data;
  communityStore.community.join_payment_link = data.url;
  communityStore.community.join_payment_link_id = data.id;
}
</script>
