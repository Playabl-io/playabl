<template>
  <div class="flex items-baseline justify-between">
    <Heading level="h1">Communities</Heading>
    <router-link to="/communities/new" class="hover:underline">
      Create a new community
    </router-link>
  </div>
  <section class="mt-12 flex justify-between items-baseline text-sm">
    <div class="flex space-x-4 py-2">
      <router-link
        v-if="store.user"
        to="/communities/joined"
        activeClass="border-b border-brand-500 dark:border-brand-300"
      >
        Joined
      </router-link>
      <router-link
        to="/communities/all"
        activeClass="border-b border-brand-500 dark:border-brand-300"
      >
        Browse all
      </router-link>
      <router-link
        v-if="store.user"
        to="/communities/manage"
        activeClass="border-b border-brand-500 dark:border-brand-300"
      >
        Manage
      </router-link>
    </div>
  </section>
  <section class="grid grid-cols-1 gap-8 mt-12">
    <span v-if="isLoading" class="place-self-center">
      <LoadingSpinner color="brand-500" />
    </span>
    <template v-else v-for="community in communities" :key="community.id">
      <Listing
        :heading="community.name"
        :website="community.website"
        :description="community.description"
      />
      <hr class="last:hidden border-gray-300" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { PropType, toRefs } from "vue";
import { store } from "@/store";
import { Community } from "@/typings/Community";
import Heading from "./Heading.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import Listing from "./Listing.vue";
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
