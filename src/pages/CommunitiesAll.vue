<template>
  <base-template>
    <CommunitiesListing :is-loading="isLoading" :communities="communities" />
  </base-template>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import CommunitiesListing from "@/components/CommunitiesListing.vue";
import { Community } from "@/typings/Community";
import { log } from "@/util/logger";

const isLoading = ref(false);
const communities = ref<Community[]>([]);

onMounted(loadAllCommunities);

async function loadAllCommunities() {
  isLoading.value = true;
  const { data, error } = await supabase
    .from<Community>("communities")
    .select();
  if (error) {
    log({ error });
  }
  if (data) {
    communities.value = data;
  }
  isLoading.value = false;
}
</script>
