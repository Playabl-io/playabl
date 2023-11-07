<template>
  <div class="rounded-lg bg-white shadow-sm">
    <div class="relative">
      <div v-if="gameCoverImage" class="aspect-w-16 aspect-h-9">
        <router-link :to="`/games/${session.game_id.id}`">
          <img
            class="w-full h-full object-center object-cover rounded-t-lg"
            :src="gameCoverImage"
            :alt="`Cover image for ${session.game_id.title}`"
            loading="lazy"
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
    <section class="px-3 pt-3 grid gap-2">
      <div v-if="isPlayingInGame || isWaitlisted" class="flex justify-end">
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
      <div class="text-blue-700 bg-gray-100 p-4 rounded-md">
        <div class="flex gap-2 mb-2">
          <UserGroupIcon class="w-5 h-5 shrink-0" />
          <router-link
            :to="`/communities/${
              session.game_id.community_id.url_short_name ||
              session.game_id.community_id.id
            }`"
            class="text-sm line-clamp-2 underline decoration-dashed"
          >
            {{ session.game_id.community_id.name }}
          </router-link>
        </div>
        <div v-if="session.game_id.community_events" class="flex gap-2">
          <CalendarIcon class="w-5 h-5 shrink-0" />
          <a
            :href="`/events/${session.game_id.community_events.id}`"
            class="font-semibold text-sm line-clamp-2 underline decoration-dashed"
          >
            {{ session.game_id.community_events.title }}
          </a>
        </div>
      </div>
      <div>
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
        <div v-if="!isWithinRange" class="text-sm text-red-500 flex gap-1 mt-2">
          <ExclamationTriangleIcon class="w-5 h-5" />
          <p>This session is outside of your preferred time</p>
        </div>
        <p class="text-xs text-slate-700 mt-1">
          {{
            formatDuration(
              intervalToDuration({
                start: session.start_time,
                end: session.end_time,
              }),
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
          {{ relatedSessions.length }} related
          {{
            pluralize({ count: relatedSessions.length, singular: "session" })
          }}
          <ChevronRightIcon
            class="h-5 w-5 text-slate-500 transition-all"
            :class="open && 'rotate-90 transform'"
          />
        </DisclosureButton>
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform opacity-0"
          enter-to-class="transform opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform opacity-100"
          leave-to-class="transform opacity-0"
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
                    }),
                  )
                }}
              </li>
            </ul>
          </DisclosurePanel>
        </transition>
      </Disclosure>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, PropType } from "vue";
import {
  EllipsisHorizontalCircleIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import {
  ChevronRightIcon,
  StarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/20/solid";
import { format, formatDuration, intervalToDuration } from "date-fns";
import Heading from "@/components/Heading.vue";
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
import { userCanRsvp } from "@/util/time";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import {
  rsvpToAllGameSessions,
  joinSession,
  sessionIsWithinRange,
} from "@/api/gamesAndSessions";
import { getCoverImageUrl } from "@/api/storage";
import { pluralize } from "@/util/grammar";
import { Session } from "@/typings/Session";
import { sessionWithGame } from "../IndexPage.vue";

const { showSuccess, showError } = useToast();

const props = defineProps({
  session: {
    type: Object as PropType<sessionWithGame>,
    required: true,
  },
  allGameSessions: {
    type: Array as PropType<
      {
        start_time: number;
        end_time: number;
        id: string;
        rsvps: Session["rsvps"];
        access_times?: Session["access_times"];
      }[]
    >,
    required: true,
  },
});

const emit = defineEmits(["refresh"]);

const isWithinRange = computed(() =>
  sessionIsWithinRange({
    session: props.session,
    starttime: store.userSettings?.starttime,
    endtime: store.userSettings?.endtime,
  }),
);

const { data: gameCoverImage } = useSWRV(
  props.session.game_id.cover_image,
  getCoverImageUrl,
);
const { data } = useSWRV<Profile>(props.session.creator_id, loadProfile);

const canRsvp = userCanRsvp({
  userAccess: store.userCommunityAccess,
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
  props.allGameSessions.filter((session) => session.id !== props.session.id),
);

const otherReservableSessions = computed(() =>
  relatedSessions.value.filter((session) =>
    userCanRsvp({
      userAccess: store.userCommunityAccess,
      session,
      userId: store.user?.id,
      hostId: props.session.creator_id,
    }),
  ),
);

const canRsvpToRelatedSessions = computed(() => {
  if (otherReservableSessions.value.length === 0) return false;
  return true;
});

const sessionPlacement = computed(() =>
  props.allGameSessions.findIndex((session) => session.id === props.session.id),
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
