<template>
  <section
    class="relative my-12 flex flex-wrap gap-4 items-baseline text-sm h-6"
  >
    <transition
      enter-active-class="transform-gpu duration-300 ease-out"
      leave-active-class="absolute transform-gpu duration-200"
      enter-from-class="opacity-0 translate-y-full"
      leave-to-class="opacity-0 translate-y-full"
      enter-to-class="opacity-1 translate-y-0"
      leave-from-class="opacity-1 translate-y-0"
      mode="out-in"
    >
      <div v-if="!showSubNav" class="flex items-center gap-4">
        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Home',
            'border-transparent': currentRoute.name !== 'Home',
          }"
        >
          Home
        </router-link>
        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }/calendar`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Calendar',
            'border-transparent': currentRoute.name !== 'Calendar',
          }"
        >
          Calendar
        </router-link>
        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }/membership`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Membership',
            'border-transparent': currentRoute.name !== 'Membership',
          }"
        >
          My Membership
        </router-link>
        <template v-if="communityStore.isAdmin">
          <button
            class="flex items-center gap-1 rounded-md hover:cursor-pointer focus-styles"
            @click="showSubNav = !showSubNav"
          >
            Manage
            <ChevronDownIcon class="h-4 w-4" />
          </button>
        </template>
      </div>
      <div v-else class="flex flex-wrap items-center gap-4">
        <button
          class="flex items-center gap-1 rounded-md hover:cursor-pointer focus-styles"
          @click="showSubNav = !showSubNav"
        >
          Manage
          <ChevronUpIcon class="h-4 w-4" />
        </button>

        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }/manage/overview`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Overview',
            'border-transparent': currentRoute.name !== 'Overview',
          }"
        >
          Overview
        </router-link>
        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }/manage/access`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Access',
            'border-transparent': currentRoute.name !== 'Access',
          }"
        >
          Access
        </router-link>
        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }/manage/info`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Info',
            'border-transparent': currentRoute.name !== 'Info',
          }"
        >
          Info
        </router-link>
        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }/manage/integrations`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Integrations',
            'border-transparent': currentRoute.name !== 'Integrations',
          }"
        >
          Integrations
        </router-link>
        <router-link
          :to="`/communities/${
            communityStore.community.url_short_name ||
            communityStore.community.id
          }/manage/members`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Members',
            'border-transparent': currentRoute.name !== 'Members',
          }"
        >
          Members
        </router-link>
      </div>
    </transition>
  </section>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/20/solid";
import { communityStore } from "./communityStore";

const currentRoute = useRoute();

const subRoutes = ["Overview", "Access", "Info", "Integrations", "Members"];

const showSubNav = ref(
  communityStore.isAdmin && subRoutes.includes(currentRoute.name as string)
);
</script>
