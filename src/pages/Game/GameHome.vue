<template>
  <div v-if="gameCoverImage" class="aspect-w-16 aspect-h-9 mb-8">
    <img
      class="w-full h-full object-center object-cover shadow-md rounded-lg"
      :src="gameCoverImage"
      alt="image"
    />
  </div>
  <div v-if="gameStore.game?.description" class="p-8 bg-gray-200 rounded-lg">
    <QuillEditor
      theme="bubble"
      :content="JSON.parse(gameStore.game.description)"
      read-only
    />
  </div>
  <div class="mt-8 flex space-x-8">
    <GameBadge
      v-if="gameStore.game?.system"
      title="System"
      :value="gameStore.game?.system"
    >
      <template #icon>
        <TagIcon class="w-6 h-6 mr-4" />
      </template>
    </GameBadge>
    <GameBadge
      v-if="gameStore.game?.virtual_tabletop"
      title="VTT"
      :value="gameStore.game?.virtual_tabletop"
    >
      <template #icon>
        <CogIcon class="w-6 h-6 mr-4" />
      </template>
    </GameBadge>
    <GameBadge title="Players" :value="gameStore.game?.participant_count || 0">
      <template #icon>
        <UsersIcon class="w-6 h-6 mr-4" />
      </template>
    </GameBadge>
    <GameBadge
      title="Recorded"
      :value="`${gameStore.game?.will_be_recorded ? 'Yes' : 'No'}`"
    >
      <template #icon>
        <FilmIcon class="w-6 h-6 mr-4" />
      </template>
    </GameBadge>
  </div>
  <section class="mt-12">
    <Heading level="h6" as="h2">Sessions</Heading>
    <div class="grid gap-8 mt-8">
      <template v-for="session in gameStore.sessions" :key="session.id">
        <SessionBlock
          :session="session"
          :participant-count="session.participant_count"
          :user-access="userAccess"
          :is-owner="isOwner"
        />
        <hr class="last:hidden border-slate-200" />
      </template>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRefs } from "vue";
import { UsersIcon, TagIcon, CogIcon, FilmIcon } from "@heroicons/vue/outline";
import Heading from "@/components/Heading.vue";
import SessionBlock from "@/components/Game/SessionBlock.vue";
import { loadUserCommunityAccess } from "@/api/communityAccess";
import { store } from "@/store";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";
import { getCoverImageUrl } from "@/api/storage";
import GameBadge from "@/components/Game/GameBadge.vue";
import { gameStore } from "./gameStore";

const props = defineProps({
  isOwner: {
    type: Boolean,
    required: true,
  },
});
toRefs(props);

const userAccess = ref<CommunityAccess[]>();
const gameCoverImage = ref("");

onMounted(async () => {
  getUserAccess();
  setSubscription();
  if (gameStore.game?.cover_image) {
    gameCoverImage.value = await getCoverImageUrl(gameStore.game.cover_image);
  }
});

async function getUserAccess() {
  if (!store.user) return;
  const data = await loadUserCommunityAccess({
    userId: store.user?.id,
    communityId: gameStore.game?.community_id || "",
  });
  if (data) {
    userAccess.value = data;
  }
}

let subscription: RealtimeSubscription;
onUnmounted(() => {
  removeSubscription();
  store.sessionRsvps = {};
});

function setSubscription() {
  subscription = supabase
    .from("rsvps")
    .on("DELETE", (payload) => {
      const sessionIds = Object.keys(store.sessionRsvps);
      sessionIds.forEach((id) => {
        store.sessionRsvps[id] = store.sessionRsvps[id].filter(
          (rsvp) => rsvp.id !== payload.old.id
        );
      });
    })
    .on("INSERT", async (payload) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", payload.new.user_id)
        .single();
      const newRsvp = { ...payload.new, user_id: data };
      store.sessionRsvps[payload.new.session_id] = Array.isArray(
        store.sessionRsvps[payload.new.session_id]
      )
        ? [...store.sessionRsvps[payload.new.session_id], newRsvp]
        : [newRsvp];
    })
    .subscribe();
}
function removeSubscription() {
  supabase.removeSubscription(subscription);
}
</script>
<style scoped>
.game-details {
  grid-template-columns: repeat(3, auto);
}
</style>
