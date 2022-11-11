<template>
  <div class="rounded-md border border-solid border-gray-300">
    <img
      v-if="product?.images[0]"
      :src="product?.images[0]"
      class="rounded-t-md w-full h-24 object-cover"
    />
    <div class="bg-gray-100 rounded-t-md p-3 flex justify-between gap-2">
      <div class="font-semibold">
        {{ product?.name }}
      </div>
      <div class="relative">
        <div v-if="saving" class="animation-spin w-5 h-5" />
        <Menu v-else>
          <MenuButton>
            <EllipsisHorizontalCircleIcon class="h-6 w-6" />
          </MenuButton>
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0"
            enter-to-class="transform opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0"
          >
            <MenuItems
              class="absolute -translate-x-3/4 whitespace-nowrap text-sm flex flex-col items-stetch gap-2 bg-white border border-solid border-gray-200 border-opacity-70 rounded-lg text-slate-900 p-2 z-20 shadow-xl"
            >
              <MenuItem v-slot="{ active }">
                <button
                  class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                  :class="{
                    'bg-gray-200': active,
                  }"
                  @click="emit('setActive')"
                >
                  Set as active
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <router-link
                  :to="`https://dashboard.stripe.com/products/${price.id}`"
                  class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                  :class="{
                    'bg-gray-200': active,
                  }"
                >
                  View on Stripe
                </router-link>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
    <div class="p-3">
      <div
        v-if="props.price.id === communityStore.community.join_price_id"
        class="p-2 rounded-md bg-green-200 shadow-sm w-min mb-3"
      >
        <p class="text-sm font-semibold">Active</p>
      </div>
      <p v-if="product?.description" class="text-sm mb-2">
        {{ product?.description }}
      </p>
      <template v-if="price.recurring">
        {{ formattedPrice }} per {{ price.recurring?.interval }}
      </template>
      <template v-else-if="formattedCustomPrices">
        <div class="grid grid-cols-3 gap-2">
          <div class="flex flex-col items-start">
            <p class="text-xs font-semibold text-slate-700">Minimum</p>
            <p>{{ formattedCustomPrices.minimum }}</p>
          </div>
          <div class="flex flex-col items-start">
            <p class="text-xs font-semibold text-slate-700">Maximum</p>
            <p>{{ formattedCustomPrices.maximum }}</p>
          </div>
          <div class="flex flex-col items-start">
            <p class="text-xs font-semibold text-slate-700">Preset</p>
            <p>{{ formattedCustomPrices.preset }}</p>
          </div>
        </div>
      </template>
      <template v-else-if="price.type === 'one_time'">
        {{ formattedPrice }}
      </template>
      <template v-else>
        <p>No set price</p>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType, onMounted, ref, computed } from "vue";
import { EllipsisHorizontalCircleIcon } from "@heroicons/vue/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import Stripe from "stripe";
import { getStripeProduct } from "@/api/stripe";
import { communityStore } from "./communityStore";

const props = defineProps({
  stripeAccountId: {
    type: String,
    required: true,
  },
  price: {
    type: Object as PropType<Stripe.Price>,
    required: true,
  },
});

const emit = defineEmits(["setActive"]);

const product = ref<Stripe.Product>();
const saving = ref(false);

const formattedPrice = computed(() => {
  if (!props.price.unit_amount) return;
  const price = props.price.unit_amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: props.price.currency,
  }).format(price);
});

const formattedCustomPrices = computed(() => {
  const { minimum, maximum, preset } = props.price.custom_unit_amount ?? {};
  if (!minimum || !maximum || !preset) {
    return;
  }
  return {
    minimum: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: props.price.currency,
    }).format(minimum / 100),
    maximum: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: props.price.currency,
    }).format(maximum / 100),
    preset: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: props.price.currency,
    }).format(preset / 100),
  };
});

onMounted(async () => {
  if (typeof props.price.product === "string") {
    const data = await getStripeProduct({
      stripeAccountId: props.stripeAccountId,
      productId: props.price.product,
    });
    product.value = data;
  } else {
    if (props.price.product.deleted) return;
    product.value = props.price.product;
  }
});
</script>
