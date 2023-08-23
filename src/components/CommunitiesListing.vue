<template>
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
import { PropType } from "vue";
import { Community } from "@/typings/Community";
import LoadingSpinner from "./LoadingSpinner.vue";
import CommunityListing from "./CommunityListing.vue";

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  communities: {
    type: Array as PropType<Community[]>,
    required: true,
  },
});
</script>
