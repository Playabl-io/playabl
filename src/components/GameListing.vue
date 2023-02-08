<template>
  <section class="grid gap-6 w-full max-w-4xl mx-auto">
    <div class="grid gap-6">
      <div>
        <router-link :to="`/games/${game.id}`" class="hover:underline">
          <heading level="h6">{{ game.title }}</heading>
        </router-link>
        <router-link
          class="mt-1 hover:underline active:underline text-slate-600 dark:text-slate-400 text-sm"
          :to="`/communities/${game.community_id.id}`"
        >
          {{ game.community_id.name }}
        </router-link>
      </div>
    </div>
    <div class="flex flex-col">
      <Disclosure v-slot="{ open }">
        <DisclosureButton
          class="p-4 bg-violet-100 text-brand-500 text-left rounded-lg flex justify-between"
        >
          {{ game.sessions.length }} upcoming
          {{ pluralize({ count: game.sessions.length, singular: "session" }) }}
          <component
            :is="open ? ChevronDownIcon : ChevronUpIcon"
            class="h-5 w-5"
          />
        </DisclosureButton>
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="transform opacity-0"
          enter-to-class="transform opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform opacity-100"
          leave-to-class="transform opacity-0"
        >
          <DisclosurePanel class="p-4 flex flex-col gap-3">
            <template v-if="saving">
              <LoadingSpinner class="mx-auto" color="brand-500" />
            </template>
            <template v-else>
              <GameListingSession
                v-for="session in sessions"
                :key="session.id"
                :session="session"
                :user-access="userAccess"
                :creator-id="game.creator_id"
                @rsvp="handleRsvp"
              />
              <PrimaryButton
                v-if="reservableSessions.length > 0"
                @click="handleRsvpToAll"
                >RSVP to all sessions</PrimaryButton
              >
            </template>
          </DisclosurePanel>
        </transition>
      </Disclosure>
    </div>

    <div class="grid md:grid-cols-2 items-start gap-4">
      <div v-if="coverImageUrl" class="relative aspect-w-16 aspect-h-9">
        <router-link
          :to="`/games/${game.id}`"
          :aria-label="`View ${game.title}`"
        >
          <img
            class="w-full h-full object-center object-cover rounded-lg"
            :src="coverImageUrl"
            alt=""
            loading="lazy"
          />
        </router-link>
      </div>
      <div
        class="grid grid-cols-2 place-content-start items-start gap-4"
        :class="{ 'col-span-full md:grid-cols-4': !coverImageUrl }"
      >
        <GameBadge v-if="game.system" title="System" :value="game.system">
          <template #icon>
            <TagIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge
          v-if="game.virtual_tabletop"
          title="VTT"
          :value="game.virtual_tabletop"
        >
          <template #icon>
            <CogIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge title="Players" :value="game.participant_count || 0">
          <template #icon>
            <UsersIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge
          title="Recorded"
          :value="`${game.will_be_recorded ? 'Yes' : 'No'}`"
        >
          <template #icon>
            <FilmIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
        <GameBadge
          title="Safety tools"
          :value="`${game.uses_safety_tools ? 'Yes' : 'No'}`"
        >
          <template #icon>
            <LifebuoyIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
      </div>
    </div>
    <div
      class="bg-gray-200 bg-opacity-70 rounded-lg p-4 max-h-96 overflow-auto"
    >
      <TipTapDisplay :content="game.description" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { PropType, ref, onMounted, computed } from "vue";
import {
  TagIcon,
  CogIcon,
  UsersIcon,
  FilmIcon,
  LifebuoyIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import Heading from "./Heading.vue";
import { GameListing } from "@/typings/Game";
import GameBadge from "./Game/GameBadge.vue";
import { getCoverImageUrl } from "@/api/storage";
import TipTapDisplay from "./TipTapDisplay.vue";
import { pluralize } from "@/util/grammar";
import { CommunityAccess } from "@/typings/CommunityAccess";
import GameListingSession from "./Game/GameListingSession.vue";
import PrimaryButton from "./Buttons/PrimaryButton.vue";
import { store } from "@/store";
import { userCanRsvp } from "@/util/time";
import { joinSession } from "@/api/gamesAndSessions";
import useToast from "./Toast/useToast";
import LoadingSpinner from "./LoadingSpinner.vue";
import { Session } from "@/typings/Session";

const { showError, showSuccess } = useToast();

const props = defineProps({
  game: {
    type: Object as PropType<GameListing>,
    required: true,
  },
  userAccess: {
    type: Array as PropType<CommunityAccess[]>,
    default: () => [],
  },
});

const sessions = ref(props.game.sessions);

const coverImageUrl = ref("");
const reservableSessions = computed(() => {
  return sessions.value.filter((session) =>
    userCanRsvp({
      userAccess: props.userAccess,
      session,
      userId: store.user?.id,
      hostId: props.game.creator_id,
    })
  );
});
const saving = ref(false);

onMounted(async () => {
  if (props.game.cover_image) {
    coverImageUrl.value = await getCoverImageUrl(props.game.cover_image);
  }
});

async function handleRsvp(sessionId: Session["id"]) {
  if (!store.user?.id) return;
  saving.value = true;
  try {
    await joinSession({ sessionId, userId: store.user.id });
    showSuccess({ message: "Successfully joined session" });
    addUserToLocalSession(sessionId, store.user.id);
  } catch (error) {
    showError({ message: "Unable to RSVP to session" });
  } finally {
    saving.value = false;
  }
}

async function handleRsvpToAll() {
  if (!store.user?.id) return;
  const userId = store.user.id;
  try {
    saving.value = true;
    const results = await Promise.allSettled(
      reservableSessions.value.map((session) =>
        joinSession({ sessionId: session.id, userId }).then(() =>
          addUserToLocalSession(session.id, userId)
        )
      )
    );
    for (const result of results) {
      if (result.status === "rejected") {
        throw new Error("Unable to RSVP to all");
      }
    }
  } catch (error) {
    showError({ message: "Unable to RSVP to all sessions " });
  } finally {
    saving.value = false;
  }
}

function addUserToLocalSession(sessionId: Session["id"], userId: string) {
  sessions.value = sessions.value.map((session) => {
    if (session.id === sessionId) {
      session.rsvps.push(userId);
    }
    return session;
  });
}
</script>
