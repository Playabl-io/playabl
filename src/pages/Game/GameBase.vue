<template>
  <BaseTemplate>
    <div v-if="isLoading" class="h-full grid place-items-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else-if="gameStore.game.deleted_at">
      This game has been cancelled
    </div>
    <div v-else>
      <div class="flex items-center">
        <Heading level="h1" class="inline">{{ gameStore.game.title }}</Heading>
        <div
          v-if="gameStore.game.deleted_at"
          class="ml-8 mt-4 p-2 rounded-xl bg-red-700 text-white inline-flex"
        >
          Cancelled
        </div>
      </div>
      <div class="flex flex-col gap-3 items-start text-blue-700 mt-6">
        <p class="text-slate-700">
          By {{ gameData?.creator_id.username || "" }}
        </p>
        <div class="flex gap-2">
          <UserGroupIcon class="w-5 h-5" />
          <router-link
            :to="`/communities/${
              gameStore.community.url_short_name || gameStore.community.id
            }`"
            class="text-sm underline decoration-dashed"
          >
            {{ gameStore.community.name }}
          </router-link>
        </div>
        <div v-if="gameStore.game.community_events" class="flex gap-2">
          <CalendarIcon class="w-5 h-5" />
          <router-link
            class="text-sm underline decoration-dashed"
            :to="`/events/${gameStore.game.community_events.id}`"
          >
            {{ gameStore.game.community_events.title }}
          </router-link>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap gap-8">
        <GameBadge
          v-if="gameStore.game?.system"
          title="System"
          :value="gameStore.game?.system"
        >
          <template #icon>
            <TagIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge
          v-if="gameStore.game?.virtual_tabletop"
          title="VTT"
          :value="gameStore.game?.virtual_tabletop"
        >
          <template #icon>
            <CogIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge
          title="Players"
          :value="gameStore.game?.participant_count || 0"
        >
          <template #icon>
            <UsersIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge
          title="Recorded"
          :value="`${gameStore.game?.will_be_recorded ? 'Yes' : 'No'}`"
        >
          <template #icon>
            <FilmIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge
          title="Safety tools"
          :value="`${gameStore.game?.uses_safety_tools ? 'Yes' : 'No'}`"
        >
          <template #icon>
            <LifebuoyIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
      </div>

      <section class="my-12 flex justify-between items-baseline text-sm">
        <div class="flex space-x-4 py-2">
          <router-link
            :to="`/games/${id}`"
            exact-active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Sessions
          </router-link>
          <router-link
            v-if="hasAccess"
            :to="`/games/${id}/info`"
            exact-active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Additional Info
          </router-link>
          <router-link
            v-if="canManage && !gameStore.game.deleted_at"
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
            :user-membership="userMembership"
          />
        </KeepAlive>
      </router-view>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RealtimeChannel } from "@supabase/realtime-js";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { store } from "@/store";
import { GameWithCommunityAndSessions } from "@/typings/Game";
import { clearGameStore, gameStore } from "./gameStore";
import * as R from "ramda";
import { Session } from "@/typings/Session";
import { loadUserCommunityMembership } from "@/api/communityMemberships";
import {
  UsersIcon,
  TagIcon,
  CogIcon,
  FilmIcon,
  LifebuoyIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import GameBadge from "@/components/Game/GameBadge.vue";
import { ROLES } from "@/util/roles";
import { getCoverImageUrl } from "@/api/storage";

const router = useRouter();
const currentRoute = useRoute();
const { game_id: id } = currentRoute.params;

const gameData = ref<GameWithCommunityAndSessions>();
const canManage = ref(false);
const isOwner = ref(false);
const isLoading = ref(true);
const userMembership = ref({});

const userIsInTheGame = computed(() =>
  gameStore.sessions.some((session) =>
    session.rsvps.includes(store.user?.id ?? "")
  )
);

const hasAccess = computed(() => {
  return userIsInTheGame.value || canManage.value;
});

onMounted(async () => {
  await getGameData();
  if (currentRoute.path.includes("manage") && !canManage.value) {
    router.replace(`/games/${id}?unauthorized=true`);
  }

  if (currentRoute.path.includes("info") && !hasAccess.value) {
    router.replace(`/games/${id}?unauthorized=true`);
  }
  if (currentRoute.path.includes("messages") && !hasAccess.value) {
    router.replace(`/games/${id}?unauthorized=true`);
  }
  isLoading.value = false;
});

async function getGameData() {
  const { data, error } = await supabase
    .from("games")
    .select(
      "*, creator_id (*), sessions (*), community_id (*), community_events (*)"
    )
    .eq("id", id as string)
    .is("community_events.deleted_at", null)
    .order("start_time", { foreignTable: "sessions" })
    .single();

  if (error) {
    log({ error });
  }

  if (data) {
    const game = {
      ...R.omit(
        ["creator_id", "sessions", "community_id"],
        data as GameWithCommunityAndSessions
      ),
      creator_id: data.creator_id.id,
      community_id: data.community_id.id,
    };
    gameStore.game = game;
    gameStore.community = data.community_id;
    setSubscription(data.id);
    setSessionDataInStore(data.sessions);
    loadAndSetAttendeesInStore(
      R.compose(R.uniq, R.flatten, R.pluck("rsvps"))(data.sessions)
    );
    gameData.value = data;

    if (data.cover_image) {
      loadCoverImageUrl(data.cover_image);
    }

    if (store.user?.id) {
      isOwner.value = data.creator_id.id === store.user?.id;
      const membership = await loadUserCommunityMembership({
        userId: store.user.id,
        communityId: data.community_id.id,
      });
      if (!membership) return;
      userMembership.value = membership;
      canManage.value = membership.role_id === ROLES.admin || isOwner.value;
    }
  }
}

async function loadCoverImageUrl(path: string) {
  gameStore.coverImage = await getCoverImageUrl(path);
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

let subscription: RealtimeChannel;
onUnmounted(() => {
  clearGameStore();
  removeSubscription();
});

function setSubscription(gameId: number) {
  subscription = supabase
    .channel(`public:sessions:game_id=eq.${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        gameStore.sessions = gameStore.sessions.map((session) => {
          if (session.id === payload.new.id) {
            return payload.new as Session;
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
      }
    )
    .subscribe();
}
function removeSubscription() {
  supabase.removeChannel(subscription);
}
</script>
