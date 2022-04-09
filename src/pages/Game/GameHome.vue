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
  <div class="mt-8 flex flex-wrap gap-8">
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
    <GameBadge
      title="Safety tools"
      :value="`${gameStore.game?.uses_safety_tools ? 'Yes' : 'No'}`"
    >
      <template #icon>
        <SupportIcon class="w-6 h-6 mr-4" />
      </template>
    </GameBadge>
  </div>
  <section v-if="!gameStore.game.deleted_at" class="mt-12">
    <Heading level="h6" as="h2">Sessions</Heading>
    <div class="grid md:grid-cols-2 gap-8 mt-8">
      <SessionBlock
        v-for="session in gameStore.sessions"
        :key="session.id"
        :session="session"
        :participant-count="session.participant_count"
        :user-access="userAccess"
        :is-owner="isOwner"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref, toRefs } from "vue";
import {
  UsersIcon,
  TagIcon,
  CogIcon,
  FilmIcon,
  SupportIcon,
} from "@heroicons/vue/outline";
import Heading from "@/components/Heading.vue";
import SessionBlock from "@/components/Game/SessionBlock.vue";
import { loadUserCommunityAccess } from "@/api/communityAccess";
import { store } from "@/store";
import { CommunityAccess } from "@/typings/CommunityAccess";
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
</script>
<style scoped>
.game-details {
  grid-template-columns: repeat(3, auto);
}
</style>
