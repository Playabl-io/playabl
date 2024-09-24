<template>
  <li
    class="grid session-list-item-grid gap-2 rounded-md even:bg-white odd:bg-gray-200 p-2 items-center"
  >
    <UserBadge
      v-if="data"
      :username="data.username"
      :pronouns="data.pronouns"
      :email="data.email"
      :avatar-url="data.avatar_url"
    />
    <div>
      <router-link
        :to="`/games/${session.game_id.id}`"
        aria-describedby="game-title-system"
      >
        <p class="text-md">
          {{ session.game_id.title }}
        </p>
        <p class="text-sm text-slate-700 mt-1">
          {{ session.game_id.system }}
        </p>
      </router-link>
    </div>
    <div class="flex flex-col gap-1" aria-describedby="time">
      <p class="text-sm">
        {{ format(session.start_time, "EEE, MMM do h:mm aa") }} -
        {{ format(session.end_time, "EEE, MMM do h:mm aa") }}
      </p>
      <p class="text-sm text-slate-700">
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
    <div class="text-xs" aria-describedby="open-seats">
      <p v-if="session.has_openings">
        {{ session.participant_count - session.rsvps.length }} seats available
      </p>
      <p v-else>
        {{ session.rsvps.length - session.participant_count }} waitlisted
      </p>
    </div>
    <div class="items-center relative">
      <Menu>
        <MenuButton aria-label="Available actions">
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
            class="absolute -translate-x-3/4 whitespace-nowrap text-sm flex flex-col items-stetch gap-2 bg-gray-50 border border-solid border-gray-200 border-opacity-70 rounded-lg text-slate-900 p-2 z-20 shadow-xl"
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
            <MenuItem v-else-if="canRsvpToRelatedSessions" v-slot="{ active }">
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
    <Disclosure v-if="relatedSessions.length > 0" v-slot="{ open }">
      <DisclosureButton
        class="pt-2 col-span-full text-xs flex justify-center items-center"
      >
        {{ numberToWord(sessionPlacement + 1) }} of
        {{ allGameSessions.length }} sessions
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
        <DisclosurePanel class="text-sm text-slate-700">
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
  </li>
</template>
<script setup lang="ts">
import { computed, PropType } from "vue";
import { EllipsisHorizontalCircleIcon } from "@heroicons/vue/24/outline";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { format, formatDuration, intervalToDuration } from "date-fns";
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
import { rsvpToAllGameSessions, joinSession } from "@/api/gamesAndSessions";
import { numberToWord } from "@/util/grammar";
import { sessionWithGame } from "../IndexPage.vue";

const { showSuccess, showError } = useToast();

const props = defineProps({
  session: {
    type: Object as PropType<sessionWithGame>,
    required: true,
  },
  allGameSessions: {
    type: Object as PropType<sessionWithGame[]>,
    required: true,
  },
});

const emit = defineEmits(["refresh"]);

const { data } = useSWRV<Profile>(props.session.creator_id, loadProfile);

const canRsvp = userCanRsvp({
  userAccess: store.userCommunityAccess,
  session: props.session,
  userId: store.user?.id,
  hostId: props.session.creator_id,
});

const relatedSessions = computed(() =>
  props.allGameSessions.filter((session) => session.id !== props.session.id)
);

const otherReservableSessions = computed(() =>
  relatedSessions.value.filter((session) =>
    userCanRsvp({
      userAccess: store.userCommunityAccess,
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
<style scoped>
.session-list-item-grid {
  grid-template-columns: auto;
}
@media screen(md) {
  .session-list-item-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) 120px 60px;
  }
}
</style>
