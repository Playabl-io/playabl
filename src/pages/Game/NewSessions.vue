<template>
  <div class="mb-8">
    <Heading level="h6" as="h3"> Add new sessions </Heading>
    <p class="text-sm mt-2">
      Add more sessions to your game using the tool below. Create the necessary
      times, pre-seat members (if enabled), and select any access policies to
      apply.
    </p>
  </div>
  <div class="flex gap-2 mb-3">
    <SecondaryButton
      color="blue"
      type="button"
      @click="newSessionModalOpen = true"
    >
      Add session times
    </SecondaryButton>
    <SecondaryButton
      v-if="gameStore.community.allow_pre_seat"
      color="blue"
      :disabled="sessionsToCreate.length === 0"
      type="button"
      @click="preSeatMemberModalOpen = true"
      >Pre-seat a member</SecondaryButton
    >
  </div>
  <Well aria-live="polite" class="relative [min-height:128px]">
    <p
      v-if="sessionsToCreate.length === 0"
      class="text-slate-700 absolute top-2 left-2 text-sm"
    >
      Added sessions will appear here
    </p>
    <AddSessions
      :sessions="sortedSessions"
      :pre-seat-assignments="preSeatAssignments"
      @delete-session="deleteSession"
    />
  </Well>
  <section class="mt-6 mb-8">
    <AccessTimes
      :set-by-event="Boolean(gameStore.game.community_events)"
      :enabled-levels="accessLevels"
      grid="grid gap-4"
      @update="accessLevels = $event"
    />
  </section>
  <div v-if="dateError" class="bg-rose-100 py-2 px-3 rounded-md">
    <p class="text-rose-900">{{ dateError }}</p>
  </div>
  <PrimaryButton
    :disabled="sessionsToCreate.length === 0 || Boolean(dateError)"
    class="mt-3"
    :is-loading="isCreating"
    @click="createSessions"
    >Create new sessions</PrimaryButton
  >
  <NewSessionsModal
    :open="newSessionModalOpen"
    :not-before="sessionNotBefore"
    :not-after="sessionNotAfter"
    @cancel="newSessionModalOpen = false"
    @close="newSessionModalOpen = false"
    @submit="addSessions"
  />
  <PreSeatMemberModal
    :open="preSeatMemberModalOpen"
    :community-id="gameStore.community.id"
    :sessions="sortedSessions"
    :pre-seat-assignments="preSeatAssignments"
    @close="preSeatMemberModalOpen = false"
    @save="preSeatAssignments = $event"
  />
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { isAfter, isBefore } from "date-fns";
import { supabase } from "@/supabase";
import Heading from "@/components/Heading.vue";
import { store } from "@/store";
import { gameStore } from "./gameStore";
import { Session } from "@/typings/Session";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import useToast from "@/components/Toast/useToast";
import NewSessionsModal from "@/components/Modals/NewSessionsModal.vue";
import PreSeatMemberModal from "@/components/Modals/PreSeatMemberModal.vue";
import { getStartOfToday, rsvpTimes } from "@/util/time";
import { Member } from "@/typings/Member";
import AddSessions from "@/components/Game/AddSessions.vue";
import Well from "@/components/Well.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import AccessTimes from "@/components/Game/AccessTimes.vue";
import client from "@/api/client";
import { getAccessLevels } from "@/storeActions";
import * as R from "ramda";

const { showSuccess, showError } = useToast();

const newSessionModalOpen = ref(false);
const isCreating = ref(false);
const sessionsToCreate = ref<Session[]>([]);
const preSeatAssignments = ref<{ [id: string]: { members: Member[] } }>({});
const preSeatMemberModalOpen = ref(false);
const accessLevels = ref<number[]>([]);

const sortedSessions = computed(() => {
  return sessionsToCreate.value
    .slice()
    .sort((sessionA, sessionB) => sessionA.start_time - sessionB.start_time);
});

const sessionNotBefore = computed(() => {
  return gameStore.game.community_events
    ? new Date(gameStore.game.community_events?.start_time)
    : getStartOfToday();
});

const sessionNotAfter = computed(() => {
  const postingLimit = gameStore.community.furthest_posting_date
    ? new Date(gameStore.community.furthest_posting_date)
    : undefined;
  return gameStore.game.community_events
    ? new Date(gameStore.game.community_events?.end_time)
    : postingLimit;
});

const dateError = computed(() => {
  for (const session of sessionsToCreate.value) {
    const startDate = new Date(session.start_time);
    const endDate = new Date(session.end_time);

    if (isBefore(startDate, sessionNotBefore.value)) {
      return "One or more sessions is before earliest available time";
    }
    if (sessionNotAfter.value && isAfter(endDate, sessionNotAfter.value)) {
      return "One or more sessions is after latest available time";
    }
  }
  return "";
});

function addSessions(dates: { start: Date; end: Date }[]) {
  if (!store.user) return;
  for (const date of dates) {
    const localId = uuidv4();
    const session = {
      id: localId,
      start_time: date.start.getTime(),
      end_time: date.end.getTime(),
      creator_id: store.user.id,
      game_id: 0,
      participant_count: gameStore.game.participant_count,
      has_openings: true,
      community_id: gameStore.game.community_id,
      rsvps: [],
    };
    sessionsToCreate.value.push(session);
  }
}

function getLevelsFromStore(ids: number[]) {
  return store.communityAccessLevels.filter((level) => ids.includes(level.id));
}

async function createSessions() {
  const levels = gameStore.game.community_events
    ? getLevelsFromStore(
        gameStore.game.community_events?.event_access_levels ?? [],
      )
    : getLevelsFromStore(accessLevels.value);
  const times = rsvpTimes(
    levels,
    gameStore.game.community_events?.fixed_access_time ?? undefined,
    gameStore.game.community_events?.event_access_levels ? "policy" : "global",
  );
  const toCreate = sessionsToCreate.value.map((session) => {
    // remove the local ID
    const partial = R.omit(["id"], session);
    if (preSeatAssignments.value[session.id]?.members.length > 0) {
      partial.rsvps = preSeatAssignments.value[session.id]?.members.map(
        (member) => member.id,
      );
    }
    partial.access_times = JSON.stringify(times);
    partial.game_id = gameStore.game.id;
    return partial;
  });

  try {
    const { data } = await supabase.from("sessions").insert(toCreate).select();
    if (data) {
      await client.post(`/.netlify/functions/notifyPreSeat`, data);
      gameStore.sessions = gameStore.sessions.concat(data);
      showSuccess({ message: "Sessions created" });
      sessionsToCreate.value = [];
      preSeatAssignments.value = {};
    }
  } catch (error) {
    showError({
      message:
        "An error occurred setting up the sessions. Please manually review.",
    });
  }
}

function deleteSession(id: string) {
  sessionsToCreate.value = sessionsToCreate.value.filter(
    (session) => session.id !== id,
  );
}

onMounted(async () => {
  /**
   * AccessTimes component is coupled to store.communityAccessLevels
   * so we have to load those and set them. Since that component is now used in
   * a couple of places, it should probably be updated to not be
   * coupled to that store
   */
  const mandatory = await getAccessLevels(gameStore.game.community_id);
  accessLevels.value = mandatory;
});
</script>
