<template>
  <div v-if="gameStore.coverImage" class="aspect-w-16 aspect-h-9 mb-8">
    <img
      class="w-full h-full object-center object-cover shadow-md rounded-lg"
      :src="gameStore.coverImage"
      alt="image"
    />
  </div>
  <div v-if="gameStore.game?.description" class="p-8 bg-gray-100 rounded-lg">
    <TipTapDisplay :content="gameStore.game.description" />
  </div>
  <div v-if="userIsNotMember" class="flex flex-col items-center my-12">
    <p class="text-sm text-slate-700 font-semibold mb-3">
      You must be a member of the community to RSVP
    </p>
    <PrimaryButton
      :to="`/communities/${gameStore.game.community_id}`"
      class="w-auto inline-block"
    >
      Learn more about {{ gameStore.community.name }}
    </PrimaryButton>
  </div>

  <section v-if="!gameStore.game.deleted_at" class="mt-12">
    <div class="grid md:grid-cols-2 gap-8">
      <SessionBlock
        v-for="session in gameStore.sessions"
        :key="session.id"
        :session="session"
        :participant-count="session.participant_count"
        :user-access="userAccess"
        :is-owner="isOwner"
        :not-a-member="userIsNotMember"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, PropType } from "vue";
import TipTapDisplay from "@/components/TipTapDisplay.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import SessionBlock from "@/components/Game/SessionBlock.vue";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { getCoverImageUrl } from "@/api/storage";
import { gameStore } from "./gameStore";
import { ROLES } from "@/util/roles";

const props = defineProps({
  isOwner: {
    type: Boolean,
    required: true,
  },
  userAccess: {
    type: Object as PropType<CommunityAccess[]>,
    required: true,
  },
  userMembership: {
    type: Object as PropType<{
      user_id?: string;
      role_id?: ROLES;
    }>,
    required: true,
  },
});
const gameCoverImage = ref("");

onMounted(async () => {
  if (gameStore.game?.cover_image) {
    gameCoverImage.value = await getCoverImageUrl(gameStore.game.cover_image);
  }
});

const userIsNotMember = computed(
  () => props.userMembership.role_id === undefined
);
</script>
<style scoped>
.game-details {
  grid-template-columns: repeat(3, auto);
}
</style>
