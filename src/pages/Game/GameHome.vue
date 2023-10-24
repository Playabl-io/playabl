<template>
  <section v-if="!gameStore.game.deleted_at">
    <div v-if="userIsNotMember" class="flex flex-col items-center mb-12">
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

    <Heading level="h6" as="h6" class="mb-3">
      {{ upcomingSessions.length }} upcoming
      {{ pluralize({ count: upcomingSessions.length, singular: "session" }) }}
    </Heading>
    <div class="grid md:grid-cols-2 gap-8">
      <SessionBlock
        v-for="session in upcomingSessions"
        :key="session.id"
        :session="session"
        :participant-count="session.participant_count"
        :is-owner="isOwner"
        :not-a-member="userIsNotMember"
      />
    </div>

    <Heading level="h6" as="h6" class="mt-6 mb-3">
      {{ pastSessions.length }} past
      {{ pluralize({ count: pastSessions.length, singular: "session" }) }}
    </Heading>
    <div class="grid md:grid-cols-2 gap-8">
      <SessionBlock
        v-for="session in pastSessions"
        :key="session.id"
        :session="session"
        :participant-count="session.participant_count"
        :is-owner="isOwner"
        :not-a-member="userIsNotMember"
      />
    </div>
  </section>
  <Heading level="h6" as="h6" class="mt-12 mb-3"> About </Heading>
  <section class="grid items-center gap-4">
    <div v-if="gameStore.coverImage" class="aspect-w-16 aspect-h-9 max-w-lg">
      <img
        class="w-full h-full object-center object-cover rounded-lg"
        :src="gameStore.coverImage"
        alt=""
      />
    </div>
    <div
      v-if="gameStore.game?.description"
      class="p-4 bg-white rounded-lg max-w-lg"
      :class="{
        'col-span-full': !gameStore.coverImage,
      }"
    >
      <TipTapDisplay :content="gameStore.game.description" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, PropType } from "vue";
import { isAfter, isBefore } from "date-fns";
import TipTapDisplay from "@/components/TipTapDisplay.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import SessionBlock from "@/components/Game/SessionBlock.vue";
import { getCoverImageUrl } from "@/api/storage";
import { gameStore } from "./gameStore";
import { ROLES } from "@/util/roles";
import Heading from "@/components/Heading.vue";
import { pluralize } from "@/util/grammar";

const props = defineProps({
  isOwner: {
    type: Boolean,
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
  () => props.userMembership.role_id === undefined,
);

const upcomingSessions = computed(() =>
  gameStore.sessions.filter((session) =>
    isAfter(session.start_time, new Date()),
  ),
);
const pastSessions = computed(() =>
  gameStore.sessions.filter((session) =>
    isBefore(session.start_time, new Date()),
  ),
);
</script>
