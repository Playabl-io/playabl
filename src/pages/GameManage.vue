<template>
  <div class="grid gap-12">
    <section class="section-container">
      <span class="flex items-center justify-between mb-8">
        <Heading level="h6" as="h3"> Sessions </Heading>
        <LinkButton @click="newSessionDrawerOpen = true">
          Add new session
        </LinkButton>
      </span>
      <div class="grid grid-cols-3 gap-8 mb-12">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="rounded-md bg-blue-100 pt-4 px-4 pb-2"
        >
          <div class="flex items-center">
            <ClockIcon class="h-6 w-6 mr-2 text-slate-700" />
            <span class="flex flex-col space-y-1 text-sm mb-2">
              <p>
                {{ format(new Date(session.start_time), "EEE, MMM d") }}
                {{ format(new Date(session.start_time), "hh:mm a") }}
              </p>
              <p>
                {{ format(new Date(session.start_time), "EEE, MMM d") }}
                {{ format(new Date(session.end_time), "hh:mm a") }}
              </p>
            </span>
          </div>
          <div class="flex items-center mt-2">
            <UsersIcon class="h-6 w-6 mr-2 text-slate-700" />
            <p>
              {{ session.rsvps.length }}
            </p>
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
    </section>
    <section class="section-container">
      <Heading level="h6" as="h3"> Game info </Heading>
    </section>
  </div>
  <Drawer :open="newSessionDrawerOpen" @close="newSessionDrawerOpen = false">
    <NewSession
      :game-id="game.id"
      :community-id="game.community_id"
      @add-session="addSession"
    />
  </Drawer>
  <DeleteModal
    :is-deleting="isDeleting"
    :open="deleteSessionModalOpen"
    title="Delete session"
    message="Are you sure? This cannot be undone"
    @cancel="deleteSessionModalOpen = false"
    @delete="handleDelete(sessionToDelete)"
  />
</template>
<script setup lang="ts">
import { PropType, ref, toRefs } from "vue";
import { format } from "date-fns";
import Heading from "@/components/Heading.vue";
import { ClockIcon, UsersIcon, TrashIcon } from "@heroicons/vue/outline";
import { GameWithSessionsAndRsvps } from "@/typings/Game";
import Drawer from "@/components/Drawer.vue";
import NewSession from "@/components/Game/NewSession.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import { Session, SessionWithRsvps } from "@/typings/Session";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import DeleteModal from "@/components/DeleteModal.vue";
import { supabase } from "@/supabase";

const props = defineProps({
  game: {
    type: Object as PropType<GameWithSessionsAndRsvps>,
    required: true,
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
});
toRefs(props);

const newSessionDrawerOpen = ref(false);
const deleteSessionModalOpen = ref(false);
const sessionToDelete = ref<SessionWithRsvps>();
const isDeleting = ref(false);

const sessions = ref(props.game.sessions);
function addSession(session: Session) {
  const transformedSession = {
    ...session,
    rsvps: [],
  };
  sessions.value.push(transformedSession);
  newSessionDrawerOpen.value = false;
}
function confirmDelete(session: SessionWithRsvps) {
  sessionToDelete.value = session;
  deleteSessionModalOpen.value = true;
}
async function handleDelete(session?: SessionWithRsvps) {
  if (!session) return;
  isDeleting.value = true;
  await supabase.from("sessions").delete().match({ id: session.id });
  sessions.value = sessions.value.filter((sesh) => sesh.id !== session.id);
  deleteSessionModalOpen.value = false;
  isDeleting.value = false;
}
</script>
<style scoped>
.section-container {
  @apply border border-solid border-gray-300 p-4 rounded-lg;
}
</style>
