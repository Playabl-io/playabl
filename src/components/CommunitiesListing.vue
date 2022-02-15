<template>
  <div class="flex flex-wrap gap-6 items-baseline justify-between"></div>
  <section class="flex justify-between items-baseline text-sm">
    <div class="flex flex-wrap gap-4 py-2">
      <router-link
        v-if="store.user"
        to="/communities/joined"
        active-class="border-b border-brand-500 dark:border-brand-300"
      >
        Joined
      </router-link>
      <router-link
        to="/communities/browse"
        active-class="border-b border-brand-500 dark:border-brand-300"
      >
        Browse
      </router-link>
      <router-link
        v-if="store.user"
        to="/communities/manage"
        active-class="border-b border-brand-500 dark:border-brand-300"
      >
        Manage
      </router-link>
      <router-link to="/communities/new"> New </router-link>
    </div>
  </section>
  <section class="grid grid-cols-1 gap-8 mt-12">
    <span v-if="isLoading" class="place-self-center">
      <LoadingSpinner color="brand-500" />
    </span>
    <template v-for="community in communities" v-else :key="community.id">
      <CommunityListing :community="community" />
      <hr class="last:hidden border-slate-200" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { PropType, toRefs } from "vue";
import { store } from "@/store";
import { Community } from "@/typings/Community";
import LoadingSpinner from "./LoadingSpinner.vue";
import CommunityListing from "./CommunityListing.vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  communities: {
    type: Array as PropType<Community[]>,
    required: true,
  },
});
toRefs(props);
</script>
