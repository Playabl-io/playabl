<template>
  <div class="relative">
    <div
      class="w-full relative"
      :class="{
        'aspect-w-16 aspect-h-9': communityStore.coverImageUrl,
      }"
    >
      <img
        v-if="communityStore.coverImageUrl"
        class="w-full h-full object-center object-cover shadow-md rounded-lg"
        :src="communityStore.coverImageUrl"
        alt="image"
      />
      <div
        :class="[
          communityStore.coverImageUrl
            ? 'bg-gradient-to-b from-transparent via-transparent to-slate-900'
            : 'bg-gradient-to-r from-purple-500 to-pink-500',
        ]"
        class="w-full h-full flex flex-col justify-end rounded-lg"
      >
        <div class="flex justify-between px-6 py-4">
          <dd class="grid lg:grid-cols-3 gap-4 grow text-neutral-100">
            <span>
              <dt class="text-xs text-opacity-60">Members</dt>
              <dd class="font-semibold">{{ communityStore.membersCount }}</dd>
            </span>
            <span>
              <dt class="text-xs text-opacity-60">Upcoming games</dt>
              <dd class="font-semibold">{{ communityStore.gamesCount }}</dd>
            </span>
            <span>
              <dt class="text-xs text-opacity-60">Community Since</dt>
              <dd class="font-semibold">
                {{ format(new Date(community.created_at), "LLL do, yyyy") }}
              </dd>
            </span>
          </dd>
          <a
            v-if="community.how_to_join"
            href="#how-to-join"
            class="text-neutral-100 text-lg font-bold"
          >
            How to join
          </a>
          <PrimaryButton
            v-else-if="community.allow_public_signup && !isCommunityMember"
            :is-loading="isJoining"
            class="self-end"
            @click="handleJoinCommunity"
          >
            Join Community
          </PrimaryButton>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-12 p-8 bg-gray-200 rounded-lg">
    <p class="mx-auto prose dark:prose-invert prose-lg whitespace-pre-wrap">
      {{ community.description }}
    </p>
  </div>
  <div class="mt-12">
    <Heading v-if="community.how_to_join" id="how-to-join" level="h6" as="h2">
      How to join
    </Heading>
    <p class="mt-2 whitespace-pre-wrap">
      {{ community.how_to_join }}
    </p>
  </div>
  <div class="mt-12 flex flex-col">
    <Heading level="h6" as="h2">Community links and happenings</Heading>
    <div class="grid md:grid-cols-2 gap-10 py-8">
      <div class="flex flex-col space-y-4">
        <a
          v-if="community.code_of_conduct_url"
          :href="community.code_of_conduct_url"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Code of conduct
        </a>
        <a
          v-if="community.website"
          :href="community.website"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Website
        </a>
        <a
          v-if="community.twitter"
          :href="community.twitter"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Twitter
        </a>
        <a
          v-if="community.facebook"
          :href="community.facebook"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Facebook
        </a>
        <a
          v-if="community.discord"
          :href="community.discord"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Discord
        </a>
        <a
          v-if="community.slack"
          :href="community.slack"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Slack
        </a>
      </div>
      <div
        v-if="community.twitter"
        id="twitter-timeline"
        class="shadow-md rounded-lg [height:480px] overflow-auto"
      />
    </div>
    <SignUpModal
      :open="displaySignUp"
      @signed-in="handleSignInAndJoin"
      @cancel="displaySignUp = false"
    />
  </div>
</template>
<script setup lang="ts">
import { Community } from "@/typings/Community";
import { PropType, toRefs, computed, onMounted, ref } from "vue";
import { format } from "date-fns";
import { communityStore } from "./communityStore";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import Heading from "@/components/Heading.vue";
import SignUpModal from "@/components/Modals/SignUpModal.vue";
import { store } from "@/store";
import { joinCommunity } from "@/api/communities";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";

const { showSuccess, showError } = useToast();

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});
toRefs(props);

const isJoining = ref(false);
const displaySignUp = ref(false);

const isCommunityMember = computed(() => {
  return (
    communityStore.isAdmin ||
    communityStore.isCreator ||
    communityStore.isPlayer
  );
});

onMounted(() => {
  if (props.community.twitter) {
    window.twttr?.widgets.createTimeline(
      {
        sourceType: "profile",
        screenName: props.community.twitter,
      },
      document.getElementById("twitter-timeline")
    );
  }
});

function handleSignInAndJoin() {
  displaySignUp.value = false;
  handleJoinCommunity();
}

async function handleJoinCommunity() {
  if (!store.user?.id) {
    displaySignUp.value = true;
    return;
  }
  isJoining.value = true;
  try {
    await joinCommunity({
      userId: store.user.id,
      communityId: props.community.id,
    });
    communityStore.isPlayer = true;
    showSuccess({ message: `Welcome to ${props.community.name}` });
  } catch (error) {
    showError({ message: "Something went wrong" });
    log({ error });
  } finally {
    isJoining.value = false;
  }
}
</script>
