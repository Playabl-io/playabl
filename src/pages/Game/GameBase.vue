<template>
  <BaseTemplate>
    <div v-if="isLoading" class="h-full grid place-items-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else>
      <Heading level="h1">{{ gameStore.game.title }}</Heading>
      <p class="mt-6">By {{ gameData?.creator_id.username || "" }}</p>
      <section class="my-12 flex justify-between items-baseline text-sm">
        <div class="flex space-x-4 py-2">
          <router-link
            :to="`/games/${id}`"
            exact-active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Details
          </router-link>
          <router-link
            v-if="isOwner"
            :to="`/games/${id}/manage`"
            active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Manage
          </router-link>
        </div>
      </section>
      <router-view v-slot="{ Component, route }">
        <KeepAlive>
          <component
            :is="Component"
            :key="route.meta.usePathKey ? route.path : undefined"
            :is-owner="isOwner"
          />
        </KeepAlive>
      </router-view>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { store } from "@/store";
import { GameWithSessionsAndRsvps } from "@/typings/Game";
import { SessionWithRsvps } from "@/typings/Session";
import { gameStore } from "./gameStore";
import * as R from "ramda";

const currentRoute = useRoute();
const { game_id: id } = currentRoute.params;

const gameData = ref<GameWithSessionsAndRsvps>();
const isOwner = ref(false);
const isLoading = ref(true);

onMounted(async () => {
  await getGameData();
  isLoading.value = false;
});

async function getGameData() {
  const { data, error } = await supabase
    .from<GameWithSessionsAndRsvps>("games")
    .select("*, creator_id (*), sessions (*)")
    .eq("id", id as string)
    .order("start_time", { foreignTable: "sessions" })
    .single();

  if (error) {
    log({ error });
  }

  if (data) {
    gameStore.game = {
      ...R.omit(["creator_id", "sessions"], data),
      creator_id: data.creator_id.id,
    };
    setSessionDataInStore(data.sessions);
    gameData.value = data;
    if (data.creator_id.id === store.user?.id) {
      isOwner.value = true;
    }
  }
}

function setSessionDataInStore(sessions: SessionWithRsvps[]) {
  gameStore.sessions = sessions;
  sessions.forEach((session) => {
    store.sessionRsvps[session.id] = session.rsvps;
  });
}
</script>
