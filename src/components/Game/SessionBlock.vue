<template>
  <div class="flex flex-col">
    <div class="p-4 rounded-md border border-solid border-gray-200 shadow-md">
      <div class="grid grid-cols-2">
        <div>
          <p class="text-lg font-bold">
            {{ format(new Date(session.start_time), "EEE, MMM do") }}
          </p>
          <p class="text-sm mt-2 text-slate-800">
            {{ format(new Date(session.start_time), "h:mm a") }} -
            {{ format(new Date(session.end_time), "h:mm a z") }}
          </p>
        </div>
        <template v-if="!isOwner">
          <GhostButton
            v-if="userIsInTheGame"
            :is-loading="isProcessing"
            @click="handleLeave"
          >
            Leave session
          </GhostButton>
          <PrimaryButton
            v-else-if="canRsvp"
            class="self-center mx-4"
            :is-loading="isProcessing"
            @click="handleJoin"
          >
            Join
          </PrimaryButton>
          <div
            v-else-if="soonestRsvp"
            class="text-sm text-slate-700 text-center"
          >
            RSVP available {{ formatRelative(soonestRsvp, new Date()) }}
          </div>
          <p v-else class="text-center text-sm">
            You cannot RSVP, likely because you need to be assigned an access
            level.
            <br />Please contact the community organizers.
          </p>
        </template>
      </div>
    </div>
    <div class="grid gap-4 mt-6">
      <div class="col-span-2">
        <h6 class="text-xs text-slate-600 mb-2">RSVP'd</h6>
        <ul class="mb-4">
          <li v-for="rsvp in participants[0]" :key="rsvp">
            {{ rsvp }}
          </li>
        </ul>
        <h6 class="text-xs text-slate-600 mb-2">Waitlist</h6>
        <ul>
          <li v-for="rsvp in participants[1]" :key="rsvp">
            {{ rsvp }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, PropType, ref, toRefs } from "vue";
import { format, formatRelative } from "date-fns";
import * as R from "ramda";
import { Session } from "@/typings/Session";
import { joinSession, leaveSession } from "@/api/games";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { compareUserAccessToRsvpTimes, getSoonestRsvpTime } from "@/util/time";
import { store } from "@/store";
import useToast from "../Toast/useToast";
import GhostButton from "../Buttons/GhostButton.vue";
import { gameStore } from "@/pages/Game/gameStore";

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
  userAccess: {
    type: Array as PropType<CommunityAccess[]>,
    default: () => [],
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
});
toRefs(props);

const isProcessing = ref(false);

const canRsvp = computed(() => {
  let accessTimes;
  if (typeof props.session.access_times === "string") {
    accessTimes = JSON.parse(props.session.access_times);
  } else {
    accessTimes = props.session.access_times;
  }
  const isEligibleToRsvp = compareUserAccessToRsvpTimes(
    props.userAccess,
    accessTimes
  );
  return isEligibleToRsvp;
});

const soonestRsvp = computed(() => {
  let accessTimes;
  if (typeof props.session.access_times === "string") {
    accessTimes = JSON.parse(props.session.access_times);
  } else {
    accessTimes = props.session.access_times;
  }
  return getSoonestRsvpTime(props.userAccess, accessTimes);
});

const splitAtParticipantCount = R.splitAt(props.participantCount);
const rsvps = computed(
  () =>
    gameStore.sessions.find((session) => session.id === props.session.id)?.rsvps
);
const participants = computed(() => {
  return splitAtParticipantCount(rsvps.value ?? []);
});
const userIsInTheGame = computed(() =>
  rsvps.value?.includes(store.user?.id ?? "")
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
</script>
