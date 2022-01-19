<template>
  <base-template>
    <CommunitiesListing :is-loading="isLoading" :communities="communities" />
  </base-template>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";
import BaseTemplate from "@/components/BaseTemplate.vue";
import CommunitiesListing from "@/components/CommunitiesListing.vue";
import { Community } from "@/typings/Community";
import { log } from "@/util/logger";
import { store } from "../store";
import { ADMIN } from "@/util/roles";

const isLoading = ref(false);
const communities = ref([] as Community[]);

onMounted(loadManagedCommunities);
async function loadManagedCommunities() {
  if (!store.user) return;
  isLoading.value = true;
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id (*)")
    .eq("user_id", store.user.id)
    .eq("role_id", ADMIN);
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
