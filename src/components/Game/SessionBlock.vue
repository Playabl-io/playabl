<template>
  <div
    class="p-4 rounded-md relative shadow-sm"
    :class="[
      isBefore(session.start_time, new Date()) ? 'bg-slate-50' : 'bg-white',
    ]"
  >
    <div v-if="isSameDay(startDate, endDate)">
      <p class="text-lg font-bold">
        {{ format(startDate, "EEE, MMM do") }}
      </p>
      <p class="text-sm text-slate-800">
        {{ format(startDate, "h:mm a") }} -
        {{ format(endDate, "h:mm a O") }}
      </p>
    </div>
    <div v-else>
      <p class="text-lg font-bold">
        {{ format(startDate, "EEE, MMM do") }} -
        {{ format(endDate, "EEE, MMM do") }}
      </p>
      <p class="text-sm text-slate-800">
        {{ format(startDate, "h:mm a") }} -
        {{ format(endDate, "h:mm a O") }}
      </p>
    </div>
    <div v-if="!isWithinRange" class="text-sm text-red-500 flex gap-1 mt-2">
      <ExclamationTriangleIcon class="w-5 h-5" />
      <p>This session is outside of your preferred time</p>
    </div>
    <div v-if="!isBefore(session.start_time, new Date())">
      <div v-if="!isOwner" class="mt-4 mb-8">
        <SecondaryButton
          v-if="userIsInTheGame"
          :is-loading="isProcessing"
          class="w-full"
          :disabled="isJoining"
          @click="handleLeave"
        >
          Leave session
        </SecondaryButton>
        <PrimaryButton
          v-else-if="canRsvp"
          class="w-full"
          :is-loading="isProcessing"
          :disabled="isJoining"
          @click="handleJoin"
        >
          Join
        </PrimaryButton>
        <div
          v-else
          class="text-slate-700 text-center flex items-center flex-wrap gap-1"
        >
          {{ rsvpAvailableMessage }}
          <span v-if="timeTillRsvp" class="italic"> ({{ timeTillRsvp }}) </span>
        </div>
      </div>
    </div>
    <div class="mt-8 grid gap-4">
      <div>
        <h6 class="text-sm font-semibold text-slate-600 mb-2">RSVP'd</h6>
        <ul>
          <SessionAttendee
            v-for="rsvp in participants[0]"
            :id="rsvp"
            :key="rsvp"
            :is-owner="isOwner"
            @remove-user="removeRsvp"
          />
        </ul>
      </div>
      <div>
        <h6 class="text-sm font-semibold text-slate-600 mb-2">Waitlist</h6>
        <ul>
          <SessionAttendee
            v-for="rsvp in participants[1]"
            :id="rsvp"
            :key="rsvp"
            :is-owner="isOwner"
            @remove-user="removeRsvp"
          />
        </ul>
      </div>
    </div>
    <div class="mt-4 grid sm:grid-cols-2 content-center gap-2">
      <AddToGoogleCal
        :start-time="session.start_time"
        :end-time="session.end_time"
      />
      <DownloadCal
        :start-time="session.start_time"
        :end-time="session.end_time"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { format, isBefore, isSameDay } from "date-fns";
import * as R from "ramda";
import { Session } from "@/typings/Session";
import {
  joinSession,
  leaveSession,
  sendRemovalEmail,
  sessionIsWithinRange,
} from "@/api/gamesAndSessions";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import { store } from "@/store";
import useToast from "../Toast/useToast";
import { gameStore } from "@/pages/Game/gameStore";
import SessionAttendee from "@/pages/Game/SessionAttendee.vue";
import AddToGoogleCal from "./AddToGoogleCal.vue";
import DownloadCal from "./DownloadCal.vue";
import SecondaryButton from "../Buttons/SecondaryButton.vue";
import { Profile } from "@/typings/Profile";
import { useCanRsvp } from "@/composables/useCanRsvp";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const { showSuccess, showError } = useToast();

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true,
  },
  participantCount: {
    type: Number,
    required: true,
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
  notAMember: {
    type: Boolean,
    required: true,
  },
  isJoining: {
    type: Boolean,
    default: false,
  },
});

const isProcessing = ref(false);

const isWithinRange = computed(() =>
  sessionIsWithinRange({
    session: props.session,
    starttime: store.userSettings?.starttime,
    endtime: store.userSettings?.endtime,
  }),
);

const startDate = computed(() => new Date(props.session.start_time));
const endDate = computed(() => new Date(props.session.end_time));

const { canRsvp, timeTillRsvp, rsvpAvailableMessage } = useCanRsvp({
  session: props.session,
});

const splitAtParticipantCount = R.splitAt(props.participantCount);
const rsvps = computed(
  () =>
    gameStore.sessions.find((session) => session.id === props.session.id)
      ?.rsvps,
);
const participants = computed(() => {
  return splitAtParticipantCount(rsvps.value ?? []);
});
const userIsInTheGame = computed(
  () => rsvps.value?.includes(store.user?.id ?? ""),
);

async function handleJoin() {
  if (!store.user) return;
  isProcessing.value = true;
  try {
    await joinSession({ sessionId: props.session.id, userId: store.user.id });
    showSuccess({ message: "Successfully RSVP'd" });
  } catch (error) {
    showError({ message: "Unable to join session" });
  } finally {
    isProcessing.value = false;
  }
}

async function handleLeave() {
  if (!store.user) return;
  isProcessing.value = true;
  try {
    await leaveSession({ sessionId: props.session.id, userId: store.user.id });
    showSuccess({ message: "Successfully left session" });
  } catch (error) {
    showError({ message: "Unable to leave session" });
  } finally {
    isProcessing.value = false;
  }
}

async function removeRsvp(userId: Profile["id"]) {
  const user = gameStore.attendees[userId];
  if (!user) {
    showError({ message: "User not found! This shouldn't happen." });
    return;
  }
  try {
    await leaveSession({ sessionId: props.session.id, userId });
    await sendRemovalEmail({
      toEmail: user.email,
      toName: user.username || user.email,
      gameName: gameStore.game.title,
      gameId: gameStore.game.id,
      sessionTime: props.session.start_time,
    });
    showSuccess({ message: "User removed from session" });
  } catch (error) {
    showError({ message: "Unable to remove user from session" });
  }
}
</script>
