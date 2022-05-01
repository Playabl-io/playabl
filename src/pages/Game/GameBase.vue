<template>
  <BaseTemplate>
    <div v-if="isLoading" class="h-full grid place-items-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else>
      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <InfoBanner
          v-if="currentRoute.query.unauthorized"
          class="mb-6"
          @dismiss="router.replace(currentRoute.path)"
        >
          You are not authorized to view that page
        </InfoBanner>
      </transition>
      <div class="flex items-center">
        <Heading level="h1" class="inline">{{ gameStore.game.title }}</Heading>
        <div
          v-if="gameStore.game.deleted_at"
          class="ml-8 mt-4 p-2 rounded-xl bg-red-700 text-white inline-flex"
        >
          Cancelled
        </div>
      </div>
      <p class="mt-6">By {{ gameData?.creator_id.username || "" }}</p>
      <router-link
        :to="`/communities/${gameStore.community.id}`"
        class="mt-2 text-xs text-slate-700"
      >
        Part of {{ gameStore.community.name }}
      </router-link>

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
            <SupportIcon class="w-6 h-6 mr-4" />
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
            v-if="canManage || userIsInTheGame"
            :to="`/games/${id}/details`"
            exact-active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Details
          </router-link>
          <router-link
            v-if="canManage && !gameStore.game.deleted_at"
            :to="`/games/${id}/manage`"
            active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Manage
          </router-link>
          <DropdownMenu v-if="userIsInTheGame || canManage">
            <template #title> Message </template>
            <template #items>
              <DropdownMenuItem
                v-if="userIsInTheGame"
                @click="openContactBoxToGameCreator"
              >
                Message Game Creator
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="canManage"
                @click="openContactBoxToRsvpGamePlayers"
              >
                Message RSVP'd Players
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="canManage"
                @click="openContactBoxToAllGamePlayers"
              >
                Message All Players
              </DropdownMenuItem>
            </template>
          </DropdownMenu>
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
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";
import { log } from "@/util/logger";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import InfoBanner from "@/components/Banners/InfoBanner.vue";
import { store } from "@/store";
import { GameWithCommunityAndSessions } from "@/typings/Game";
import { gameStore } from "./gameStore";
import * as R from "ramda";
import { Session } from "@/typings/Session";
import { userIsCommunityAdmin } from "@/api/communityMemberships";
import {
  UsersIcon,
  TagIcon,
  CogIcon,
  FilmIcon,
  SupportIcon,
} from "@heroicons/vue/outline";
import GameBadge from "@/components/Game/GameBadge.vue";
import useMessageBox from "@/components/MessageBox/useMessageBox";
import useToast from "@/components/Toast/useToast";
import { sendMessageAboutGame } from "@/api/contact";
import DropdownMenu from "@/components/Menus/DropdownMenu.vue";
import DropdownMenuItem from "@/components/Menus/DropdownMenuItem.vue";

const { openMessageBox, closeMessageBox, setMessageIsSubmitting } =
  useMessageBox();
const { showError, showSuccess } = useToast();
const router = useRouter();
const currentRoute = useRoute();
const { game_id: id } = currentRoute.params;

const gameData = ref<GameWithCommunityAndSessions>();
const canManage = ref(false);
const isOwner = ref(false);
const isLoading = ref(true);

const userIsInTheGame = computed(() =>
  gameStore.sessions.some((session) =>
    session.rsvps.includes(store.user?.id ?? "")
  )
);

onMounted(async () => {
  await getGameData();
  if (currentRoute.path.includes("manage") && !canManage.value) {
    router.replace(`/games/${id}?unauthorized=true`);
  }
  isLoading.value = false;
});

async function getGameData() {
  const { data, error } = await supabase
    .from<GameWithCommunityAndSessions>("games")
    .select("*, creator_id (*), sessions (*), community_id (*)")
    .eq("id", id as string)
    .order("start_time", { foreignTable: "sessions" })
    .single();

  if (error) {
    log({ error });
  }

  if (data) {
    gameStore.game = {
      ...R.omit(["creator_id", "sessions", "community_id"], data),
      creator_id: data.creator_id.id,
      community_id: data.community_id.id,
    };
    gameStore.community = data.community_id;
    setSubscription(data.id);
    setSessionDataInStore(data.sessions);
    loadAndSetAttendeesInStore(
      R.compose(R.uniq, R.flatten, R.pluck("rsvps"))(data.sessions)
    );
    gameData.value = data;

    if (store.user?.id) {
      isOwner.value = data.creator_id.id === store.user?.id;
      const isAdmin = await userIsCommunityAdmin({
        userId: store.user.id,
        communityId: data.community_id.id,
      });
      canManage.value = isAdmin || isOwner.value;
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

function openContactBoxToGameCreator() {
  if (!store.user?.email) {
    showError({ message: "You must be signed in to send messages" });
    return;
  }
  openMessageBox({
    to: gameData.value?.creator_id.username || "Game creator",
    onSend: async function handleSend({ message, shareEmail, messageId }) {
      setMessageIsSubmitting({ messageId, isSubmitting: true });
      try {
        await sendMessageAboutGame({
          message,
          responseEmail: shareEmail ? store.user?.email : "",
          group: "creator",
          gameId: gameStore.game.id,
        });
        showSuccess({ message: "Message sent" });
        closeMessageBox(messageId);
      } catch (error) {
        showError({
          message:
            "Unable to send message. Please try again or contact support.",
        });
      } finally {
        setMessageIsSubmitting({ messageId, isSubmitting: false });
      }
    },
  });
}

function openContactBoxToRsvpGamePlayers() {
  if (!store.user?.email) {
    showError({ message: "You must be signed in to send messages" });
    return;
  }
  openMessageBox({
    to: "RSVP'd game players",
    onSend: async function handleSend({ message, shareEmail, messageId }) {
      setMessageIsSubmitting({ messageId, isSubmitting: true });
      try {
        await sendMessageAboutGame({
          message,
          responseEmail: shareEmail ? store.user?.email : "",
          group: "rsvp only",
          gameId: gameStore.game.id,
        });
        showSuccess({ message: "Message sent" });
        closeMessageBox(messageId);
      } catch (error) {
        showError({
          message:
            "Unable to send message. Please try again or contact support.",
        });
      } finally {
        setMessageIsSubmitting({ messageId, isSubmitting: false });
      }
    },
  });
}

function openContactBoxToAllGamePlayers() {
  if (!store.user?.email) {
    showError({ message: "You must be signed in to send messages" });
    return;
  }
  openMessageBox({
    to: "all game players (includes RSVP'd and waitlisted)",
    onSend: async function handleSend({ message, shareEmail, messageId }) {
      setMessageIsSubmitting({ messageId, isSubmitting: true });
      try {
        await sendMessageAboutGame({
          message,
          responseEmail: shareEmail ? store.user?.email : "",
          group: "all players",
          gameId: gameStore.game.id,
        });
        showSuccess({ message: "Message sent" });
        closeMessageBox(messageId);
      } catch (error) {
        showError({
          message:
            "Unable to send message. Please try again or contact support.",
        });
      } finally {
        setMessageIsSubmitting({ messageId, isSubmitting: false });
      }
    },
  });
}
</script>
