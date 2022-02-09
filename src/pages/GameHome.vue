<template>
  <div class="p-8 bg-slate-100 rounded-lg border border-solid border-slate-200">
    <p class="prose dark:prose-invert prose-lg whitespace-pre-wrap">
      {{ game.description }}
    </p>
  </div>
  <section class="mt-12">
    <Heading level="h6" as="h2">Sessions</Heading>
    <div class="grid gap-8 mt-8">
      <template v-for="session in game.sessions" :key="session.id">
        <SessionBlock
          :session="session"
          :participant-count="game.participant_count"
          :user-access="userAccess"
          :is-owner="isOwner"
        />
        <hr class="last:hidden border-slate-200" />
      </template>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, PropType, ref, toRefs } from "vue";
import { GameWithSessionsAndRsvps } from "@/typings/Game";
import Heading from "@/components/Heading.vue";
import SessionBlock from "@/components/Game/SessionBlock.vue";
import { loadUserCommunityAccess } from "@/api/communityAccess";
import { store } from "@/store";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";

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

const userAccess = ref<CommunityAccess[]>();

onMounted(() => {
  getUserAccess();
  setSubscription();
});

async function getUserAccess() {
  if (!store.user) return;
  const data = await loadUserCommunityAccess({
    userId: store.user?.id,
    communityId: props.game.community_id,
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
