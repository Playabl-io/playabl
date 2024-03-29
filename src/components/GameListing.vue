<template>
  <section
    class="grid gap-6 w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4"
  >
    <div class="overflow-hidden">
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
      <router-link
        v-if="game.community_events?.title"
        :to="`/events/${game.community_events?.id}`"
        class="mt-2 truncate text-brand-500 text-sm border-b border-dotted border-brand-500"
      >
        Part of the
        {{ game.community_events.title }}
        event
      </router-link>
    </div>
    <div class="flex flex-col">
      <Disclosure v-slot="{ open }">
        <DisclosureButton
          class="p-4 bg-violet-100 text-brand-500 text-left rounded-lg flex justify-between"
        >
          <div class="text-sm">
            {{ game.sessions.length }} upcoming
            {{
              pluralize({
                count: game.sessions.length,
                singular: "session",
              })
            }}
            starting
            {{ format(game.sessions[0].start_time, "MMM do") }}
          </div>
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
          <DisclosurePanel class="py-4 flex flex-col gap-3">
            <template v-if="saving">
              <LoadingSpinner class="mx-auto" color="brand-500" />
            </template>
            <template v-else>
              <GameListingSession
                v-for="session in partitionedSessions[0]"
                :key="session.id"
                :session="session"
                :creator-id="game.creator_id"
                @rsvp="handleRsvp"
              />
              <template v-if="partitionedSessions[1].length">
                <p class="text-xs">
                  Some sessions are outside of your preferred time range
                </p>
                <GameListingSession
                  v-for="session in partitionedSessions[1]"
                  :key="session.id"
                  :session="session"
                  :creator-id="game.creator_id"
                  @rsvp="handleRsvp"
                />
              </template>
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
        :class="{ 'col-span-full lg:grid-cols-4': !coverImageUrl }"
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
import GameListingSession from "./Game/GameListingSession.vue";
import PrimaryButton from "./Buttons/PrimaryButton.vue";
import { store } from "@/store";
import { userCanRsvp } from "@/util/time";
import { joinSession, sessionIsWithinRange } from "@/api/gamesAndSessions";
import useToast from "./Toast/useToast";
import LoadingSpinner from "./LoadingSpinner.vue";
import { Session } from "@/typings/Session";
import { format } from "date-fns";
import * as R from "ramda";

const { showError, showSuccess } = useToast();

const props = defineProps({
  game: {
    type: Object as PropType<GameListing>,
    required: true,
  },
});

const emit = defineEmits(["addUserToGameSession"]);

const partitionedSessions = computed(() =>
  R.partition(
    (session) =>
      sessionIsWithinRange({
        session,
        starttime: store.userSettings?.starttime,
        endtime: store.userSettings?.endtime,
      }),
    props.game.sessions,
  ),
);

const coverImageUrl = ref("");
const reservableSessions = computed(() => {
  return props.game.sessions.filter((session) =>
    userCanRsvp({
      userAccess: store.userCommunityAccess,
      session,
      userId: store.user?.id,
      hostId: props.game.creator_id,
    }),
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
    emit("addUserToGameSession", {
      gameId: props.game.id,
      sessionId,
      userId: store.user.id,
    });
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
        joinSession({ sessionId: session.id, userId }).then(() => {
          emit("addUserToGameSession", {
            gameId: props.game.id,
            sessionId: session.id,
            userId,
          });
        }),
      ),
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
</script>
