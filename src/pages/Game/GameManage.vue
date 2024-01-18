<template>
  <div v-if="gameStore.game.deleted_at">
    <p>This game has been cancelled and cannot be edited</p>
  </div>
  <div v-else class="grid gap-12">
    <div class="flex flex-wrap gap-8">
      <OutlineButton @click="editDescriptionDrawerOpen = true">
        Edit description
      </OutlineButton>
      <OutlineButton @click="editDetailsDrawerOpen = true">
        Edit game details
      </OutlineButton>
      <OutlineButton @click="cancelGameModalOpen = true">
        Cancel game
      </OutlineButton>
    </div>
    <SectionContainer>
      <div class="mb-8">
        <Heading level="h6" as="h3"> Current sessions </Heading>
        <p class="text-sm mt-2">
          Edit or delete sessions. Wanting to add more sessions? Use the form
          lower on this page
        </p>
      </div>
      <div class="grid md:grid-cols-2 gap-8">
        <div
          v-for="session in gameStore.sessions"
          :key="session.id"
          class="rounded-md bg-white pt-4 px-4 pb-2"
        >
          <div class="flex justify-end">
            <Tooltip>
              <template #trigger="{ setTooltipHidden, setTooltipVisible }">
                <GhostButton
                  class="mr-1"
                  @click="editSession(session)"
                  @mouseenter="setTooltipVisible"
                  @mouseleave="setTooltipHidden"
                  @focus="setTooltipVisible"
                  @blur="setTooltipHidden"
                >
                  <PencilSquareIcon class="h-5 w-5 text-slate-700" />
                </GhostButton>
              </template>
              <template #tooltip> Edit session time </template>
            </Tooltip>
            <Tooltip v-if="gameStore.community.allow_pre_seat">
              <template #trigger="{ setTooltipHidden, setTooltipVisible }">
                <GhostButton
                  class="mr-1"
                  @click="startSeatingFlow(session)"
                  @mouseenter="setTooltipVisible"
                  @mouseleave="setTooltipHidden"
                  @focus="setTooltipVisible"
                  @blur="setTooltipHidden"
                >
                  <UserGroupIcon class="h-5 w-5 text-slate-700" />
                </GhostButton>
              </template>
              <template #tooltip> Pre-seat someone </template>
            </Tooltip>
            <Tooltip>
              <template #trigger="{ setTooltipHidden, setTooltipVisible }">
                <GhostButton
                  class="mr-1"
                  @click="confirmDuplicate(session)"
                  @mouseenter="setTooltipVisible"
                  @mouseleave="setTooltipHidden"
                  @focus="setTooltipVisible"
                  @blur="setTooltipHidden"
                >
                  <DocumentDuplicateIcon class="h-5 w-5 text-slate-700" />
                </GhostButton>
              </template>
              <template #tooltip> Duplicate session </template>
            </Tooltip>
            <Tooltip>
              <template #trigger="{ setTooltipHidden, setTooltipVisible }">
                <GhostButton
                  class="hover:bg-neutral-200"
                  @click="confirmDelete(session)"
                  @mouseenter="setTooltipVisible"
                  @mouseleave="setTooltipHidden"
                  @focus="setTooltipVisible"
                  @blur="setTooltipHidden"
                >
                  <TrashIcon class="h-5 w-5 text-slate-700" />
                </GhostButton>
              </template>
              <template #tooltip> Delete session </template>
            </Tooltip>
          </div>
          <div class="grid gap-4">
            <div class="flex flex-col gap-1">
              <p class="text-xs uppercase text-black">Start time</p>
              <p>
                {{
                  format(new Date(session.start_time), "EEE, MMM d hh:mm a O")
                }}
              </p>
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-xs uppercase text-black">End time</p>

              <p>
                {{ format(new Date(session.end_time), "EEE, MMM d hh:mm a O") }}
              </p>
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-xs uppercase text-black">
                {{ session.rsvps.length }} RSVP'd
              </p>
              <ul>
                <template v-for="(rsvp, index) in session.rsvps" :key="rsvp">
                  <div v-if="index === gameStore.game.participant_count">
                    <p class="text-right text-xs uppercase">Waitlist</p>
                    <hr />
                  </div>
                  <SessionAttendee
                    :id="rsvp"
                    :is-owner="true"
                    @remove-user="removeRsvp(rsvp, session)"
                  />
                </template>
              </ul>
              <LoadingSpinner v-if="isSeating" />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
    <SectionContainer>
      <NewSessions />
    </SectionContainer>
    <SectionContainer>
      <GameImageLibrary />
    </SectionContainer>
  </div>

  <SideDrawer
    :open="editDescriptionDrawerOpen"
    @close="editDescriptionDrawerOpen = false"
  >
    <EditDescription
      :description="gameStore.game.description"
      :flat-description="gameStore.game.description_as_flat_text"
      :game-id="gameStore.game.id"
      @close="editDescriptionDrawerOpen = false"
    />
  </SideDrawer>
  <SideDrawer
    :open="editDetailsDrawerOpen"
    @close="editDetailsDrawerOpen = false"
  >
    <EditGameDetails @close="editDetailsDrawerOpen = false" />
  </SideDrawer>
  <SideDrawer :open="editSessionDrawerOpen" @close="clearEditSession">
    <EditSessionDetails
      v-if="sessionToEdit"
      :session="sessionToEdit"
      :community-id="gameStore.game.community_id"
      @close="clearEditSession"
    />
  </SideDrawer>
  <DuplicateSessionModal
    v-if="sessionToDuplicate"
    :open="duplicateSessionModalOpen"
    :session="sessionToDuplicate"
    @close="hideDuplicate"
  />
  <DeleteModal
    :is-deleting="isDeleting"
    :open="deleteSessionModalOpen"
    title="Delete session"
    message="Are you sure? This cannot be undone"
    @cancel="deleteSessionModalOpen = false"
    @delete="handleDelete(sessionToDelete)"
  />
  <DeleteModal
    :is-deleting="isDeleting"
    :open="cancelGameModalOpen"
    title="Cancel game"
    message="Are you sure? This cannot be undone"
    @cancel="cancelGameModalOpen = false"
    @delete="cancelGame"
  />
  <MemberSearchModal
    :open="Boolean(sessionToSeat)"
    :community-id="gameStore.community.id"
    @select="finishSeat"
    @cancel="sessionToSeat = undefined"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import { format } from "date-fns";
import { supabase } from "@/supabase";
import Heading from "@/components/Heading.vue";
import {
  DocumentDuplicateIcon,
  TrashIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import { gameStore } from "./gameStore";
import SideDrawer from "@/components/SideDrawer.vue";
import { Session } from "@/typings/Session";
import { Profile } from "@/typings/Profile";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import DeleteModal from "@/components/Modals/DeleteModal.vue";
import SectionContainer from "@/components/SectionContainer.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import EditDescription from "@/pages/Game/EditDescription.vue";
import EditGameDetails from "./EditGameDetails.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import GameImageLibrary from "./GameImageLibrary.vue";
import EditSessionDetails from "./EditSessionDetails.vue";
import Tooltip from "@/components/Tooltip.vue";
import DuplicateSessionModal from "./DuplicateSessionModal.vue";
import NewSessions from "./NewSessions.vue";
import SessionAttendee from "./SessionAttendee.vue";
import MemberSearchModal from "@/components/Modals/MemberSearchModal.vue";
import {
  joinSession,
  leaveSession,
  sendRemovalEmail,
} from "@/api/gamesAndSessions";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const { showSuccess, showError } = useToast();

const editSessionDrawerOpen = ref(false);
const editDescriptionDrawerOpen = ref(false);
const editDetailsDrawerOpen = ref(false);
const deleteSessionModalOpen = ref(false);
const cancelGameModalOpen = ref(false);
const duplicateSessionModalOpen = ref(false);
const sessionToDuplicate = ref<Session>();
const sessionToDelete = ref<Session>();
const sessionToEdit = ref<Session>();
const sessionToSeat = ref<Session>();
const isSeating = ref(false);
const isDeleting = ref(false);

function startSeatingFlow(session: Session) {
  sessionToSeat.value = session;
}

async function finishSeat(member: Profile) {
  if (!sessionToSeat.value?.id) return;
  isSeating.value = true;
  try {
    const sessionId = sessionToSeat.value.id;
    sessionToSeat.value = undefined;
    await joinSession({
      sessionId,
      userId: member.id,
      skipNotifyCreator: true,
    });

    showSuccess({ message: "Member seated" });
  } catch (err) {
    showError({ message: "Unable to seat member" });
  } finally {
    isSeating.value = false;
  }
}

function editSession(session: Session) {
  editSessionDrawerOpen.value = true;
  sessionToEdit.value = session;
}

function clearEditSession() {
  editSessionDrawerOpen.value = false;
  sessionToEdit.value = undefined;
}

function confirmDuplicate(session: Session) {
  sessionToDuplicate.value = session;
  duplicateSessionModalOpen.value = true;
}

function hideDuplicate() {
  sessionToDuplicate.value = undefined;
  duplicateSessionModalOpen.value = false;
}

function confirmDelete(session: Session) {
  sessionToDelete.value = session;
  deleteSessionModalOpen.value = true;
}

async function handleDelete(session?: Session) {
  if (!session) return;
  isDeleting.value = true;
  await supabase.from("sessions").delete().match({ id: session.id });
  gameStore.sessions = gameStore.sessions.filter(
    (sesh) => sesh.id !== session.id
  );
  deleteSessionModalOpen.value = false;
  isDeleting.value = false;
}

async function cancelGame() {
  isDeleting.value = true;
  try {
    const { error } = await supabase.rpc("cancel_game", {
      game_id: gameStore.game.id,
    });
    if (error) throw error;
    showSuccess({ message: "Game cancelled" });
    cancelGameModalOpen.value = false;
    gameStore.game.deleted_at = new Date().toLocaleDateString();
  } catch (error) {
    log({ error });
    showError({ message: "Unable to cancel game" });
  } finally {
    isDeleting.value = false;
  }
}

async function removeRsvp(userId: Profile["id"], session: Session) {
  const user = gameStore.attendees[userId];
  if (!user) {
    showError({ message: "User not found! This shouldn't happen." });
    return;
  }
  try {
    await leaveSession({ sessionId: session.id, userId });
    await sendRemovalEmail({
      toEmail: user.email,
      toName: user.username || user.email,
      gameName: gameStore.game.title,
      gameId: gameStore.game.id,
      sessionTime: session.start_time,
    });
    showSuccess({ message: "User removed from session" });
  } catch (error) {
    showError({ message: "Unable to remove user from session" });
  }
}
</script>
