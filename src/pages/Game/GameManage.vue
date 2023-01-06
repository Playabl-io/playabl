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
      <span class="flex items-center justify-between mb-8">
        <Heading level="h6" as="h3"> Sessions </Heading>
        <LinkButton @click="newSessionDrawerOpen = true">
          Add new session
        </LinkButton>
      </span>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div
          v-for="session in gameStore.sessions"
          :key="session.id"
          class="rounded-md bg-blue-100 pt-4 px-4 pb-2"
        >
          <div class="flex items-center">
            <ClockIcon class="h-6 w-6 mr-2 text-slate-700" />
            <span class="flex flex-col space-y-1 text-sm mb-2">
              <p>
                {{ format(new Date(session.start_time), "EEE, MMM d hh:mm a") }}
              </p>
              <p>
                {{ format(new Date(session.end_time), "EEE, MMM d hh:mm a") }}
              </p>
              <p>{{ format(new Date(session.end_time), "z") }}</p>
            </span>
          </div>
          <div class="flex items-center mt-2">
            <UsersIcon class="h-6 w-6 mr-2 text-slate-700" />
            <p>{{ session.rsvps.length }} rsvp'd</p>
          </div>
          <div class="flex justify-end">
            <GhostButton
              class="hover:bg-neutral-100"
              @click="confirmDelete(session)"
            >
              <TrashIcon class="h-5 w-5 text-slate-700" />
            </GhostButton>
          </div>
        </div>
      </div>
    </SectionContainer>
    <SectionContainer>
      <GameImageLibrary />
    </SectionContainer>
  </div>
  <SideDrawer
    :open="newSessionDrawerOpen"
    @close="newSessionDrawerOpen = false"
  >
    <NewSession
      :game-id="gameStore.game.id"
      :community-id="gameStore.game.community_id"
      @add-session="addSession"
    />
  </SideDrawer>
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
</template>
<script setup lang="ts">
import { ref } from "vue";
import { format } from "date-fns";
import { supabase } from "@/supabase";
import Heading from "@/components/Heading.vue";
import { ClockIcon, UsersIcon, TrashIcon } from "@heroicons/vue/24/outline";
import SideDrawer from "@/components/SideDrawer.vue";
import NewSession from "@/pages/Game/NewSession.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import { Session } from "@/typings/Session";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import DeleteModal from "@/components/Modals/DeleteModal.vue";
import SectionContainer from "@/components/SectionContainer.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import EditDescription from "@/pages/Game/EditDescription.vue";
import { gameStore } from "./gameStore";
import EditGameDetails from "./EditGameDetails.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import GameImageLibrary from "./GameImageLibrary.vue";

const { showSuccess, showError } = useToast();

const newSessionDrawerOpen = ref(false);
const editDescriptionDrawerOpen = ref(false);
const editDetailsDrawerOpen = ref(false);
const deleteSessionModalOpen = ref(false);
const cancelGameModalOpen = ref(false);
const sessionToDelete = ref<Session>();
const isDeleting = ref(false);

function addSession(session: Session) {
  const transformedSession = {
    ...session,
    rsvps: [],
  };
  gameStore.sessions.push(transformedSession);
  newSessionDrawerOpen.value = false;
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
</script>
