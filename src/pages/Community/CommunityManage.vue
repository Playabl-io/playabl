<template>
  <div>
    <div class="grid gap-4">
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

const route = useRoute();
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await Promise.all([getMemberAccess(), getAccessLevels()]);
  loading.value = false;
});

async function getMemberAccess() {
  // TODO: do this in a worker since this could be really expensive
  const { data, error } = await supabase
    .from("community_access")
    .select("id, access_level_id (name), user_id (id)")
    .eq("community_id", route.params.community_id);
  if (error) {
    log({ error });
  }
  if (data) {
    const memberAccessMap = data.reduce((acc, access) => {
      if (acc[access.user_id.id]) {
        acc[access.user_id.id].push({
          id: access.id,
          name: access.access_level_id.name,
        });
      } else {
        acc[access.user_id.id] = [
          {
            id: access.id,
            name: access.access_level_id.name,
          },
        ];
      }
      return acc;
    }, {});
    store.communityMemberAccess = memberAccessMap;
  }
}

async function getAccessLevels() {
  const data = await loadCommunityAccessTimes(
    route.params.community_id as string
  );
  if (data) {
    store.communityAccessLevels = data;
    communityStore.communityAccessLevels = data;
  }
}
</script>
