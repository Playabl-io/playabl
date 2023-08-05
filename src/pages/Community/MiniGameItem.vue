<template>
  <li class="rounded-lg bg-white shadow-sm">
    <div class="relative">
      <div v-if="gameCoverImage" class="aspect-w-16 aspect-h-9">
        <router-link :to="`/games/${session.game_id.id}`">
          <img
            class="w-full h-full object-center object-cover rounded-t-lg"
            :src="gameCoverImage"
            alt=""
          />
        </router-link>
      </div>
      <div
        :class="{
          'rounded-t-lg': !gameCoverImage,
        }"
        class="w-full h-full p-3 text-slate-700 border-b border-gray-200 flex flex-col justify-end overflow-visible"
      >
        <div class="flex items-start gap-4">
          <div class="flex flex-col items-center">
            <p class="font-semibold text-xs">Session</p>
            <p class="text-sm">
              {{ sessionPlacement + 1 }} / {{ allGameSessions.length }}
            </p>
          </div>
          <div class="flex flex-col items-center">
            <template v-if="session.has_openings">
              <p class="font-semibold text-xs">Seats available</p>
              <CheckCircleIcon class="h-5 w-5 text-green-700" />
            </template>

            <div v-else class="flex flex-col items-center">
              <p class="text-xs font-semibold">Waitlist</p>
              <p class="text-sm">
                {{ session.rsvps.length - session.participant_count }}
              </p>
            </div>
          </div>
          <div class="ml-auto relative">
            <Menu>
              <MenuButton>
                <EllipsisHorizontalCircleIcon class="h-6 w-6" />
              </MenuButton>
              <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="transform -translate-y-4 opacity-0"
                enter-to-class="transform opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="transform opacity-100"
                leave-to-class="transform -translate-y-4 opacity-0"
              >
                <MenuItems
                  class="absolute -translate-x-3/4 whitespace-nowrap text-sm flex flex-col items-stetch gap-2 bg-white border border-solid border-gray-200 border-opacity-70 rounded-lg text-slate-900 p-2 z-20 shadow-xl"
                >
                  <MenuItem v-if="canRsvp" v-slot="{ active }">
                    <button
                      class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                      :class="{
                        'bg-gray-200': active,
                      }"
                      @click="rsvpToSession"
                    >
                      RSVP to session
                    </button>
                  </MenuItem>
                  <MenuItem
                    v-if="!canRsvp && canRsvpToRelatedSessions"
                    v-slot="{ active }"
                  >
                    <button
                      class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                      :class="{
                        'bg-gray-200': active,
                      }"
                      @click="rsvpToAllSessions(otherReservableSessions)"
                    >
                      RSVP to related sessions
                    </button>
                  </MenuItem>
                  <MenuItem
                    v-else-if="canRsvpToRelatedSessions"
                    v-slot="{ active }"
                  >
                    <button
                      class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                      :class="{
                        'bg-gray-200': active,
                      }"
                      @click="rsvpToAllSessions()"
                    >
                      RSVP to all sessions
                    </button>
                  </MenuItem>
                  <MenuItem
                    v-slot="{ active }"
                    class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                  >
                    <router-link
                      :to="`/games/${session.game_id.id}`"
                      :class="{
                        'bg-gray-200': active,
                      }"
                    >
                      View game
                    </router-link>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
    <section class="px-3 pt-3">
      <div class="flex justify-end">
        <div
          v-if="isPlayingInGame"
          class="p-2 rounded-md bg-green-200 flex items-center space-x-1 shadow-sm"
        >
          <p class="text-sm font-semibold">RSVP'd</p>
          <StarIcon class="h-4 w-4 text-emerald-600" />
        </div>
        <div
          v-if="isWaitlisted"
          class="p-2 rounded-md bg-violet-200 flex items-center space-x-1 shadow-sm"
        >
          <p class="text-sm font-semibold">Waitlist</p>
          <ExclamationCircleIcon class="h-4 w-4 text-violet-600" />
        </div>
      </div>
      <div class="mt-2">
        <router-link :to="`/games/${session.game_id.id}`">
          <Heading as="h6" level="h6" class="hover:underline">
            {{ session.game_id.title }}
          </Heading>
        </router-link>
        <p class="text-sm text-slate-700">
          {{ session.game_id.system }}
        </p>
        <p class="text-xs text-slate-700 mt-3">
          {{ format(session.start_time, "EEE, MMM do h:mm aa") }} -
          {{ format(session.end_time, "EEE, MMM do h:mm aa") }}
        </p>
        <p class="text-xs text-slate-700 mt-1">
          {{
            formatDuration(
              intervalToDuration({
                start: session.start_time,
                end: session.end_time,
              })
            )
          }}
        </p>
      </div>
      <UserBadge
        v-if="data"
        class="mt-4 mb-2"
        size="small"
        :username="data.username"
        :pronouns="data.pronouns"
        :email="data.email"
        :avatar-url="data.avatar_url"
      />
      <Disclosure v-if="relatedSessions.length > 0" v-slot="{ open }">
        <DisclosureButton
          class="py-2 w-full text-xs flex justify-center items-center"
        >
          {{ relatedSessions.length }} related sessions
          <ChevronRightIcon
            class="h-5 w-5 text-slate-500 transition-all"
            :class="open && 'rotate-90 transform'"
          />
        </DisclosureButton>
        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <DisclosurePanel class="text-sm text-slate-700 p-4">
            <ul class="list-disc list-inside leading-relaxed">
              <li v-for="related in relatedSessions" :key="related.id">
                {{ format(related.start_time, "EEE, MMM do h:mm aa") }}
                {{
                  formatDuration(
                    intervalToDuration({
                      start: related.start_time,
                      end: related.end_time,
                    })
                  )
                }}
              </li>
            </ul>
          </DisclosurePanel>
        </transition>
      </Disclosure>
    </section>
  </li>
</template>
<script setup lang="ts">
import { computed, PropType } from "vue";
import {
  EllipsisHorizontalCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";
import {
  ChevronRightIcon,
  StarIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/20/solid";
import { format, formatDuration, intervalToDuration } from "date-fns";
import Heading from "@/components/Heading.vue";
import { GameSession } from "@/typings/Session";
import useSWRV from "swrv";
import { loadProfile } from "@/api/profiles";
import UserBadge from "@/components/UserBadge.vue";
import { Profile } from "@/typings/Profile";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/vue";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { userCanRsvp } from "@/util/time";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import { rsvpToAllGameSessions, joinSession } from "@/api/gamesAndSessions";
import { getCoverImageUrl } from "@/api/storage";

const { showSuccess, showError } = useToast();

const props = defineProps({
  session: {
    type: Object as PropType<GameSession>,
    required: true,
  },
  allGameSessions: {
    type: Object as PropType<GameSession[]>,
    required: true,
  },
  userAccess: {
    type: Array as PropType<CommunityAccess[]>,
    required: true,
  },
});

const emit = defineEmits(["refresh"]);

const { data: gameCoverImage } = useSWRV(
  props.session.game_id.cover_image,
  getCoverImageUrl
);
const { data } = useSWRV<Profile>(props.session.creator_id, loadProfile);

const canRsvp = userCanRsvp({
  userAccess: props.userAccess,
  session: props.session,
  userId: store.user?.id,
  hostId: props.session.creator_id,
});

const isPlayingInGame = computed(() => {
  const playerPosition = props.session.rsvps.indexOf(store.user?.id ?? "");
  if (playerPosition === -1) return false;
  return playerPosition + 1 <= props.session.participant_count;
});

const isWaitlisted = computed(() => {
  const playerPosition = props.session.rsvps.indexOf(store.user?.id ?? "");
  if (playerPosition === -1) return false;
  return playerPosition + 1 > props.session.participant_count;
});

const relatedSessions = computed(() =>
  props.allGameSessions.filter((session) => session.id !== props.session.id)
);

const otherReservableSessions = computed(() =>
  relatedSessions.value.filter((session) =>
    userCanRsvp({
      userAccess: props.userAccess,
      session,
      userId: store.user?.id,
      hostId: props.session.creator_id,
    })
  )
);

const canRsvpToRelatedSessions = computed(() => {
  if (otherReservableSessions.value.length === 0) return false;
  return true;
});

const sessionPlacement = computed(() =>
  props.allGameSessions.indexOf(props.session)
);

async function rsvpToSession() {
  if (!store.user?.id) return;
  try {
    await joinSession({ sessionId: props.session.id, userId: store.user.id });
    showSuccess({ message: "Joined session!" });
    emit("refresh");
  } catch (error) {
    showError({ message: "Unable to join session" });
  }
}

async function rsvpToAllSessions(gameSessions = props.allGameSessions) {
  if (!store.user?.id) return;
  try {
    const { totalAvailable, failed, joined } = await rsvpToAllGameSessions({
      gameSessions,
      userId: store.user.id,
    });
    if (joined === totalAvailable) {
      showSuccess({ message: "Joined all sessions!" });
    }
    if (failed > 0 && joined > 0) {
      showError({
        message: "Unable to join some sessions. Please check the game page.",
      });
    }
    if (joined === 0) {
      throw new Error("Failed to join sessions");
    }
    emit("refresh");
  } catch (error) {
    showError({ message: "Unable to join sessions" });
  }
}
</script>
