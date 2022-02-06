<template>
  <div class="p-8 bg-slate-100 rounded-lg border border-solid border-slate-200">
    <p class="prose dark:prose-invert prose-lg whitespace-pre-wrap">
      {{ game.description }}
    </p>
  </div>
  <section class="mt-12">
    <Heading level="h6" as="h2">Sessions</Heading>
    <div class="flex flex-col mt-6 max-w-md mx-auto">
      <div
        v-for="(session, i) in game.sessions"
        :key="session.id"
        class="flex flex-col relative"
      >
        <SessionBlock
          :session="session"
          :participant-count="game.participant_count"
          :user-access="userAccess"
          :is-owner="isOwner"
        />
        <div
          v-if="i !== game.sessions.length - 1"
          class="w-px h-6 border-l border-dashed border-gray-500 self-center"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, PropType, ref, toRefs } from "vue";
import { GameWithSessionsAndRsvps } from "@/typings/Game";
import Heading from "@/components/Heading.vue";
import SessionBlock from "@/components/Game/SessionBlock.vue";
import { loadUserCommunityAccess } from "@/api/communityAccess";
import { store } from "@/store";
import { CommunityAccess } from "@/typings/CommunityAccess";

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

onMounted(getUserAccess);

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
</script>
