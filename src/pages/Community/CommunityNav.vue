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
      <div class="flex items-center gap-4">
        <router-link
          :to="`/communities/${communityRoute}`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Home',
            'border-transparent': currentRoute.name !== 'Home',
          }"
        >
          Home
        </router-link>
        <router-link
          :to="`/communities/${communityRoute}/calendar`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Calendar',
            'border-transparent': currentRoute.name !== 'Calendar',
          }"
        >
          Calendar
        </router-link>
        <router-link
          :to="`/communities/${communityRoute}/events`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Events',
            'border-transparent': currentRoute.name !== 'Events',
          }"
        >
          Events
        </router-link>
        <router-link
          :to="`/communities/${communityRoute}/membership`"
          class="border-b"
          :class="{
            'border-brand-500': currentRoute.name === 'Membership',
            'border-transparent': currentRoute.name !== 'Membership',
          }"
        >
          My Membership
        </router-link>
        <template v-if="communityStore.isAdmin">
          <NavMenu>
            <template #title="{ open }">
              <span class="flex gap-2 items-center">
                Manage
                <component
                  :is="open ? ChevronUpIcon : ChevronDownIcon"
                  class="h-4 w-4"
                />
              </span>
            </template>
            <template #items>
              <NavMenuItem
                :to="`/communities/${
                  communityStore.community.url_short_name ||
                  communityStore.community.id
                }/manage/overview`"
              >
                Overview
              </NavMenuItem>
              <NavMenuItem
                :to="`/communities/${
                  communityStore.community.url_short_name ||
                  communityStore.community.id
                }/manage/access`"
              >
                Access
              </NavMenuItem>
              <NavMenuItem
                :to="`/communities/${
                  communityStore.community.url_short_name ||
                  communityStore.community.id
                }/manage/info`"
              >
                Info
              </NavMenuItem>
              <NavMenuItem
                :to="`/communities/${
                  communityStore.community.url_short_name ||
                  communityStore.community.id
                }/manage/integrations`"
              >
                Integrations
              </NavMenuItem>
              <NavMenuItem
                :to="`/communities/${
                  communityStore.community.url_short_name ||
                  communityStore.community.id
                }/manage/members`"
              >
                Members
              </NavMenuItem>
            </template>
          </NavMenu>
        </template>
      </div>
    </transition>
  </section>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/20/solid";
import { communityStore } from "./communityStore";
import NavMenu from "@/components/Menus/NavMenu.vue";
import NavMenuItem from "@/components/Menus/NavMenuItem.vue";
import { store } from "@/store";
import flags from "@/util/flags";

const currentRoute = useRoute();
const communityRoute = computed(
  () => communityStore.community.url_short_name || communityStore.community.id
);
</script>
