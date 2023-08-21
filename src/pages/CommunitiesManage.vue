<template>
  <base-template>
    <CommunitiesNav class="mb-12" />
    <div v-if="isLoading" class="grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <section
      v-else
      class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
    >
      <CommunityCard
        v-for="community in communities"
        :key="community.id"
        :community="community"
        :route="`/communities/${
          community.url_short_name || community.id
        }/manage/overview`"
      />
    </section>
  </base-template>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import CommunitiesNav from "@/components/Community/CommunitiesNav.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import CommunityCard from "@/components/Community/CommunityCard.vue";
import { Community } from "@/typings/Community";
import { log } from "@/util/logger";
import { store } from "../store";
import { ADMIN } from "@/util/roles";
import { loadUserManagedCommunities } from "@/api/communityMemberships";

const isLoading = ref(false);
const communities = ref<Community[]>([]);

onMounted(onload);
async function onload() {
  if (!store.user) return;
  isLoading.value = true;
  const data = await loadUserManagedCommunities({ userId: store.user.id });
  communities.value = data;
  isLoading.value = false;
}
</script>
