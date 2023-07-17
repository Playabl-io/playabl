<template>
  <div class="relative">
    <div class="grid md:grid-cols-2 items-start gap-6">
      <div
        v-if="communityStore.coverImageUrl"
        class="w-full relative"
        :class="{
          'aspect-w-16 aspect-h-9': communityStore.coverImageUrl,
        }"
      >
        <img
          class="w-full h-full object-center object-cover rounded-lg"
          :src="communityStore.coverImageUrl"
          alt="image"
        />
      </div>
      <div
        class="flex flex-col justify-center gap-4 h-full"
        :class="{
          'col-span-full md:grid-cols-4': !communityStore.coverImageUrl,
        }"
      >
        <dl
          class="grid grid-cols-3 gap-4 border p-3 rounded-lg border-solid border-gray-300"
        >
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
              {{
                format(
                  new Date(communityStore.community.created_at),
                  "LLL do, yyyy"
                )
              }}
            </dd>
          </span>
        </dl>
        <p v-if="isBanned" class="font-semibold text-center">
          You are banned from this community
        </p>
        <p
          v-else-if="communityStore.membershipRequest?.id"
          class="font-semibold text-center"
        >
          Membership requested
        </p>
        <div v-else-if="!isCommunityMember">
          <PrimaryButton
            v-if="communityStore.community.signup_method === 'PUBLIC'"
            :is-loading="isJoining"
            class="w-full"
            @click="handleJoinCommunity"
          >
            Join Community
          </PrimaryButton>
          <PrimaryButton
            v-else-if="communityStore.community.signup_method === 'REQUEST'"
            :is-loading="isJoining"
            class="w-full"
            @click="displayRequestToJoinModal = true"
          >
            Request to join community
          </PrimaryButton>
          <PrimaryButton
            v-else-if="communityStore.community.join_payment_link"
            :is-loading="isJoining"
            @click="handleJoinCommunity"
          >
            Checkout with Stripe
          </PrimaryButton>
        </div>
        <a
          v-if="communityStore.community.how_to_join"
          href="#how-to-join"
          class="text-brand-500 hover:underline"
        >
          How to join
        </a>
      </div>
    </div>
  </div>
  <div class="my-12">
    <Heading level="h6" as="h2" class="mb-6">Community managers</Heading>
    <div class="flex flex-wrap gap-8">
      <div
        v-for="admin in communityStore.admins"
        :key="admin.id"
        class="flex gap-4 items-center"
      >
        <UserAvatar
          :username="admin.username || admin.email"
          :avatar-url="admin.avatar_url"
        />
        <div class="flex flex-col">
          <p>{{ admin.username || admin.email }}</p>
          <p class="text-sm text-slate-700">{{ admin.pronouns }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-12 p-8 bg-gray-200 bg-opacity-70 rounded-lg">
    <p class="mx-auto prose dark:prose-invert prose-lg whitespace-pre-wrap">
      {{ communityStore.community.description }}
    </p>
  </div>
  <div class="mt-12">
    <Heading
      v-if="communityStore.community.how_to_join"
      id="how-to-join"
      level="h6"
      as="h2"
    >
      How to join
    </Heading>
    <p class="mt-2 whitespace-pre-wrap">
      {{ communityStore.community.how_to_join }}
    </p>
  </div>
  <div class="mt-12 flex flex-col">
    <Heading level="h6" as="h2">Community links and happenings</Heading>
    <div class="grid md:grid-cols-2 gap-10 py-8">
      <div class="flex flex-col space-y-4 items-start">
        <a
          v-if="communityStore.community.support_email"
          class="text-brand-500 font-semibold flex items-center hover:underline"
          :href="`mailto:${communityStore.community.support_email}`"
          target="_blank"
        >
          <EnvelopeIcon class="w-6 h-6 mr-2" />
          Contact
        </a>
        <a
          v-if="communityStore.community.code_of_conduct_url"
          :href="communityStore.community.code_of_conduct_url"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Code of conduct
        </a>
        <a
          v-if="communityStore.community.website"
          :href="communityStore.community.website"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Website
        </a>
        <a
          v-if="communityStore.community.twitter"
          :href="communityStore.community.twitter"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Twitter
        </a>
        <a
          v-if="communityStore.community.facebook"
          :href="communityStore.community.facebook"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Facebook
        </a>
        <a
          v-if="communityStore.community.discord"
          :href="communityStore.community.discord"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Discord
        </a>
        <a
          v-if="communityStore.community.slack"
          :href="communityStore.community.slack"
          target="_blank"
          rel="noreferrer noopener"
          class="text-brand-500 hover:underline font-semibold"
        >
          Slack
        </a>
      </div>
      <div
        v-if="communityStore.community.twitter"
        id="twitter-timeline"
        class="shadow-md rounded-lg [height:480px] overflow-auto"
      />
    </div>
    <SignUpModal
      :open="displaySignUp"
      @signed-in="handleSignInAndJoin"
      @cancel="displaySignUp = false"
    />
    <RequestToJoinModal
      :open="displayRequestToJoinModal"
      :community-name="communityStore.community.name"
      :community-id="communityStore.community.id"
      @close="displayRequestToJoinModal = false"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { format } from "date-fns";
import { EnvelopeIcon } from "@heroicons/vue/24/outline";
import { communityStore } from "./communityStore";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import Heading from "@/components/Heading.vue";
import SignUpModal from "@/components/Modals/SignUpModal.vue";
import { store } from "@/store";
import { joinCommunity } from "@/api/communities";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import UserAvatar from "@/components/UserAvatar.vue";
import RequestToJoinModal from "./RequestToJoinModal.vue";

const { showSuccess, showError } = useToast();

const isJoining = ref(false);
const displaySignUp = ref(false);
const displayRequestToJoinModal = ref(false);

const isCommunityMember = computed(() => {
  return (
    communityStore.isAdmin ||
    communityStore.isCreator ||
    communityStore.isPlayer
  );
});

const isBanned = computed(() => {
  const user = store.user;
  if (user?.email) {
    return communityStore.community.banned_emails?.includes(user.email);
  }
  return false;
});

onMounted(async () => {
  if (communityStore.community.twitter) {
    // @ts-expect-error TS doesn't know we loaded twitter
    window.twttr?.widgets.createTimeline(
      {
        sourceType: "profile",
        screenName: communityStore.community.twitter,
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
  if (
    store.user.email &&
    communityStore.community.banned_emails?.includes(store.user.email)
  ) {
    showError({ message: "You are not allowed to join this community" });
    return;
  }
  isJoining.value = true;
  if (communityStore.community.join_payment_link) {
    window.open(communityStore.community.join_payment_link);
    isJoining.value = false;
    return;
  }

  try {
    await joinCommunity({
      userId: store.user.id,
      communityId: communityStore.community.id,
    });
    communityStore.isPlayer = true;
    showSuccess({ message: `Welcome to ${communityStore.community.name}` });
  } catch (error) {
    showError({ message: "Something went wrong" });
    log({ error });
  } finally {
    isJoining.value = false;
  }
}
</script>
