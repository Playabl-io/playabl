<template>
  <div>
    <div v-if="loading" class="grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else class="grid gap-4">
      <router-view />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { useRoute } from "vue-router";

import { store } from "@/store";
import { communityStore } from "./communityStore";

import { loadCommunityAccessTimes } from "@/api/communityAccess";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const route = useRoute();
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await Promise.all([getMemberAccess(), getAccessLevels()]);
  loading.value = false;
});

async function getMemberAccess() {
  const communityId = communityStore.community.id;
  // TODO: do this in a worker since this could be really expensive
  const { data, error } = await supabase
    .from("community_access")
    .select("id, access_level_id (name), user_id (id)")
    .eq("community_id", communityId);
  if (error) {
    log({ error });
  }
  if (data) {
    const memberAccessMap = data.reduce((acc, access) => {
      if (
        Array.isArray(access.access_level_id) ||
        Array.isArray(access.user_id)
      ) {
        throw new Error("Unable to build member access map");
      }
      if (acc[access.user_id?.id]) {
        acc[access.user_id?.id].push({
          id: access.id,
          name: access.access_level_id?.name,
        });
      } else {
        acc[access.user_id?.id] = [
          {
            id: access.id,
            name: access.access_level_id?.name,
          },
        ];
      }
      return acc;
    }, {} as Record<string, { id: number; name: string }[]>);
    store.communityMemberAccess = memberAccessMap;
  }
}

async function getAccessLevels() {
  const id = communityStore.community.id;
  const data = await loadCommunityAccessTimes(id);
  if (data) {
    store.communityAccessLevels = data;
    communityStore.communityAccessLevels = data;
  }
}
</script>
