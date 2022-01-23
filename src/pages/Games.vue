<template>
  <base-template>
    <GamesListing :is-loading="isLoading" :games="games" />
  </base-template>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import GamesListing from "@/components/GamesListing.vue";
import { supabase } from "@/supabase";
import { Game } from "@/typings/Game";
import { log } from "@/util/logger";

const isLoading = ref(false);
const games = ref([] as Game[]);

onMounted(loadAllCommunities);

async function loadAllCommunities() {
  isLoading.value = true;
  const { data, error } = await supabase.from<Game>("games").select();
  if (error) {
    log({ error });
  }
  if (data) {
    games.value = data;
  }
  isLoading.value = false;
}
</script>
