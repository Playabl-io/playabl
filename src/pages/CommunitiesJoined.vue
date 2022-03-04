<template>
  <base-template>
    <CommunitiesNav class="mb-12" />
    <div v-if="isLoading" class="grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <section v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <CommunityCard
        v-for="community in communities"
        :key="community.id"
        :community="community"
      />
    </section>
  </base-template>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { Community } from "@/typings/Community";
import { log } from "@/util/logger";
import { store } from "../store";
import CommunityCard from "@/components/Community/CommunityCard.vue";
import CommunitiesNav from "@/components/Community/CommunitiesNav.vue";

const isLoading = ref(false);
const communities = ref<Community[]>([]);

onMounted(loadJoinedCommunities);
async function loadJoinedCommunities() {
  if (!store.user) return;
  isLoading.value = true;
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id (*)")
    .eq("user_id", store.user.id);
  if (error) {
    log({ error });
  }
  if (data) {
    communities.value = data.map((membership) => ({
      ...membership.community_id,
    }));
  }
  isLoading.value = false;
}
</script>
