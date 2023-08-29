<template>
  <section class="grid grid-cols-1 gap-8">
    <span v-if="isLoading" class="place-self-center">
      <LoadingSpinner color="brand-500" />
    </span>
    <NoResultsExplorer v-else-if="communities.length === 0" />
    <template v-for="community in communities" v-else :key="community.id">
      <CommunityListing :community="community" />
      <hr class="last:hidden border-slate-200" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { CommunityBrowse } from "@/typings/Community";
import LoadingSpinner from "./LoadingSpinner.vue";
import CommunityListing from "./CommunityListing.vue";
import NoResultsExplorer from "@/components/Search/NoResultsExplorer.vue";

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  communities: {
    type: Array as PropType<CommunityBrowse[]>,
    required: true,
  },
});
</script>
