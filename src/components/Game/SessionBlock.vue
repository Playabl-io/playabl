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
            @click="handleLeave"
            :is-loading="isProcessing"
          >
            Leave session
          </GhostButton>
          <PrimaryButton
            v-else-if="canRsvp"
            @click="handleJoin"
            class="self-center mx-4"
            :is-loading="isProcessing"
          >
            Join
          </PrimaryButton>
          <div
            v-else-if="soonestRsvp"
            class="text-sm text-slate-700 text-center"
          >
            RSVP available {{ formatRelative(soonestRsvp, new Date()) }}
          </div>
        </template>
      </div>
    </div>
    <div class="grid gap-4 mt-6">
      <div class="col-span-2">
        <h6 class="text-xs text-slate-600 mb-2">RSVP'd</h6>
        <ul class="mb-4">
          <li v-for="rsvp in rsvps[0]" :key="rsvp.id">
            {{ rsvp.user_id?.username }}
          </li>
        </ul>
        <h6 class="text-xs text-slate-600 mb-2">Waitlist</h6>
        <ul>
          <li v-for="rsvp in rsvps[1]" :key="rsvp.id">
            {{ rsvp.user_id?.username }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { format, formatRelative } from "date-fns";
import { SessionWithRsvps } from "@/typings/Session";
import { computed, onMounted, onUnmounted, PropType, ref, toRefs } from "vue";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import OutlineButton from "../Buttons/OutlineButton.vue";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { compareUserAccessToRsvpTimes, getSoonestRsvpTime } from "@/util/time";
import { store } from "@/store";
import useToast from "../Toast/useToast";
import { joinSession, leaveSession } from "@/api/games";
import * as R from "ramda";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";
import SecondaryButton from "../Buttons/SecondaryButton.vue";
import GhostButton from "../Buttons/GhostButton.vue";

const { showSuccess, showError } = useToast();

const props = defineProps({
  session: {
    type: Object as PropType<SessionWithRsvps>,
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
  const isEligibleToRsvp = compareUserAccessToRsvpTimes(
    props.userAccess,
    JSON.parse(props.session.access_times ?? "{}")
  );
  return isEligibleToRsvp;
});

const soonestRsvp = computed(() =>
  getSoonestRsvpTime(
    props.userAccess,
    JSON.parse(props.session.access_times ?? "{}")
  )
);

const splitAtParticipantCount = R.splitAt(props.participantCount);
const rsvps = computed(() => {
  return splitAtParticipantCount(store.sessionRsvps[props.session.id]);
});
const userIsInTheGame = computed(() => {
  return store.sessionRsvps[props.session.id].find(
    (rsvp) => rsvp.user_id.id === store.user?.id
  );
});

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
