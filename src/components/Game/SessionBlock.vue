<template>
  <div class="flex flex-col">
    <div class="p-6 rounded-md bg-blue-50 border border-solid border-blue-200">
      <div class="grid grid-cols-2 gap-4">
        <div
          class="mx-auto"
          :class="{
            'col-span-2': isOwner,
          }"
        >
          <p class="text-xs text-slate-700 dark:text-slate-300">
            {{ format(new Date(session.start_time), "EEE, MMM do") }}
          </p>
          <ul
            class="mt-2 text-xs font-semibold list-disc list-inside grid gap-2"
          >
            <li>
              {{ format(new Date(session.start_time), "h:mm a") }}
            </li>
            <li>
              {{ format(new Date(session.end_time), "h:mm a") }}
            </li>
          </ul>
        </div>
        <template v-if="!isOwner">
          <OutlineButton v-if="userIsInTheGame" @click="handleLeave">
            Leave session
          </OutlineButton>
          <PrimaryButton
            v-else-if="canRsvp"
            @click="handleJoin"
            class="self-center mx-4"
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
        <transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-1"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-1"
          leave-to-class="opacity-0"
        >
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
        </transition>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { format, formatRelative } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/outline";
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
import { Rsvp } from "@/typings/Rsvp";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";
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

const isJoining = ref(false);

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

const splitAtParticipantCount = R.splitAt(props.participantCount - 1);
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
  isJoining.value = true;
  try {
    await joinSession({ sessionId: props.session.id, userId: store.user.id });
    showSuccess({ message: "Successfully RSVP'd" });
  } catch (error) {
    showError({ message: "Unable to join session" });
  } finally {
    isJoining.value = false;
  }
}

async function handleLeave() {
  if (!store.user) return;
  try {
    await leaveSession({ sessionId: props.session.id, userId: store.user.id });
    showSuccess({ message: "Successfully left session" });
  } catch (error) {
    showError({ message: "Unable to leave session" });
  }
}

let subscription: RealtimeSubscription;
onMounted(setSubscription);
onUnmounted(removeSubscription);

function setSubscription() {
  subscription = supabase
    .from("rsvps")
    .on("DELETE", (payload) => {
      store.sessionRsvps[props.session.id] = store.sessionRsvps[
        props.session.id
      ].filter((rsvp) => rsvp.id !== payload.old.id);
    })
    .on("INSERT", async (payload) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", payload.new.user_id)
        .single();
      const newRsvp = { ...payload.new, user_id: data };
      store.sessionRsvps[props.session.id] = Array.isArray(
        store.sessionRsvps[props.session.id]
      )
        ? [...store.sessionRsvps[props.session.id], newRsvp]
        : [newRsvp];
    })
    .subscribe();
}
function removeSubscription() {
  supabase.removeSubscription(subscription);
}
</script>
