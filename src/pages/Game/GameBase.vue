<template>
  <BaseTemplate>
    <div v-if="isLoading" class="h-full grid place-items-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else>
      <Heading level="h1">{{ gameStore.game.title }}</Heading>
      <p class="mt-6">By {{ gameData?.creator_id.username || "" }}</p>
      <div
        v-if="gameStore.game.deleted_at"
        class="mt-4 p-2 rounded-xl bg-red-700 text-white inline-flex"
      >
        Cancelled
      </div>
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";
import { log } from "@/util/logger";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { store } from "@/store";
import { GameWithSessionsAndRsvps } from "@/typings/Game";
import { gameStore } from "./gameStore";
import * as R from "ramda";
import { Session } from "@/typings/Session";

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
    setSubscription(data.id);
    setSessionDataInStore(data.sessions);
    loadAndSetAttendeesInStore(
      R.compose(R.uniq, R.flatten, R.pluck("rsvps"))(data.sessions)
    );
    gameData.value = data;
    if (data.creator_id.id === store.user?.id) {
      isOwner.value = true;
    }
  }
}

function setSessionDataInStore(sessions: Session[]) {
  gameStore.sessions = sessions;
}

function loadAndSetAttendeesInStore(rsvps: string[]) {
  rsvps.forEach((member: string) => {
    if (gameStore.attendees[member]) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", member)
      .single()
      .then(({ data }) => {
        gameStore.attendees[member] = data;
      });
  });
}

let subscription: RealtimeSubscription;
onUnmounted(() => {
  removeSubscription();
  store.sessionRsvps = {};
});

function setSubscription(gameId: number) {
  subscription = supabase
    .from(`sessions:game_id=eq.${gameId}`)
    .on("UPDATE", (payload) => {
      gameStore.sessions = gameStore.sessions.map((session) => {
        if (session.id === payload.new.id) {
          return payload.new;
        }
        return session;
      });
      const attendeesToLoad = payload.new.rsvps.filter(
        (rsvp: string) => !gameStore.attendees[rsvp]
      );
      attendeesToLoad.forEach((member: string) =>
        supabase
          .from("profiles")
          .select("*")
          .eq("id", member)
          .single()
          .then(({ data }) => {
            gameStore.attendees[member] = data;
          })
      );
    })
    .subscribe();
}
function removeSubscription() {
  supabase.removeSubscription(subscription);
}
</script>
