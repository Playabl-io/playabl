<template>
  <DetailPageTemplate :routes="routes">
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
      <div class="flex flex-col gap-3 items-start mt-6">
        <p class="text-slate-700">
          By
          {{
            gameData?.creator_id.username ||
            gameData?.creator_id.email.slice(0, 4).concat("...")
          }}
        </p>
        <div class="flex gap-2">
          <UserGroupIcon class="w-5 h-5 text-blue-700" />
          <router-link
            :to="`/communities/${
              gameStore.community.url_short_name || gameStore.community.id
            }`"
            class="text-sm text-blue-700 border-b border-dashed border-blue-600"
          >
            {{ gameStore.community.name }}
          </router-link>
        </div>
        <div v-if="gameStore.game.community_events" class="flex gap-2">
          <CalendarIcon class="w-5 h-5 text-blue-700" />
          <router-link
            class="text-sm text-blue-700 border-b border-dashed border-blue-600"
            :to="`/events/${gameStore.game.community_events.id}`"
          >
            {{ gameStore.game.community_events.title }}
          </router-link>
        </div>
        <div v-if="gameData?.sessions[0]" class="grid gap-2">
          <GameAccessPopover :sample-session="gameData?.sessions[0]" />
        </div>
      </div>

      <div class="mt-8 mb-6 flex flex-wrap gap-8">
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
      <router-view> </router-view>
    </div>
  </DetailPageTemplate>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RealtimeChannel } from "@supabase/realtime-js";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import DetailPageTemplate from "@/layouts/DetailPageTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { store } from "@/store";
import { GameWithCommunityAndSessions } from "@/typings/Game";
import { clearGameStore, gameStore } from "./gameStore";
import * as R from "ramda";
import { Session } from "@/typings/Session";
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
import GameAccessPopover from "./GameAccessPopover.vue";

const router = useRouter();
const currentRoute = useRoute();
const { game_id: id } = currentRoute.params;

const gameData = ref<GameWithCommunityAndSessions>();
const isLoading = ref(true);

const userIsInTheGame = computed(() =>
  gameStore.sessions.some((session) =>
    session.rsvps.includes(store.user?.id ?? "")
  )
);

const membership = computed(() => {
  return store.userCommunityMembership[gameStore.game.community_id];
});

const canManage = computed(
  () =>
    membership.value?.communityMembership?.role_id === ROLES.admin ||
    gameStore.game.creator_id === store.user?.id
);
const hasAccess = computed(() => {
  return userIsInTheGame.value || canManage.value;
});

const routes = computed(() => {
  const result = [
    {
      label: "Overview",
      path: `/games/${id}/overview`,
    },
  ];
  if (hasAccess.value) {
    result.push({
      label: "Additional Info",
      path: `/games/${id}/info`,
    });
  }
  if (canManage.value && !gameStore.game.deleted_at) {
    result.push({
      label: "Manage",
      path: `/games/${id}/manage`,
    });
  }
  return result;
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
    .order("start_time", { referencedTable: "sessions" })
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
      // @ts-expect-error crazy ramda stuff that is too complicated
      R.compose(R.uniq, R.flatten, R.pluck("rsvps"))(data.sessions) as string[]
    );
    gameData.value = data;

    if (data.cover_image) {
      loadCoverImageUrl(data.cover_image);
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
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}
</script>
