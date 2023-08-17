<template>
  <Heading as="h1" level="h6">Membership Info</Heading>
  <section v-if="membership" class="grid gap-6 mt-6">
    <SectionContainer>
      <Heading as="h2" level="h6">Access</Heading>
      <div class="text-sm mt-2 mb-4">
        <p class="mb-1">
          These are the priority levels you have been granted by community
          administrators
        </p>
        <a
          href="https://docs.playabl.io/communities/access-levels.html"
          target="_blank"
          class="text-blue-700 underline"
        >
          Read more about access levels
        </a>
      </div>
      <div class="grid gap-4">
        <div v-for="level in accessLevels" :key="level.access_level_id.id">
          <p>{{ level.access_level_id.name }}</p>
          <p class="text-slate-600 text-sm">
            {{ level.access_level_id.priority_access_time }}
            {{ level.access_level_id.time_denomination }}
          </p>
        </div>
      </div>
    </SectionContainer>
    <SectionContainer>
      <Heading as="h2" level="h6">Role</Heading>
      <p class="mt-2 mb-4 text-sm">Your role in the community</p>
      <div
        class="rounded-md py-1 px-2 shadow-sm self-start text-center w-min"
        :class="{
          'bg-blue-200': communityStore.isAdmin,
          'bg-gray-200': communityStore.isPlayer,
          'bg-teal-200': communityStore.isCreator,
        }"
      >
        <p class="text-sm capitalize">{{ ROLES[communityStore.userRoleId] }}</p>
      </div>
    </SectionContainer>
    <SectionContainer>
      <Heading as="h2" level="h6">Manage membership</Heading>
      <WarningButton class="mt-6" @click="leaveCommunityModalOpen = true">
        Leave community
      </WarningButton>
    </SectionContainer>
  </section>
  <section v-else>
    <p class="text-center font-semibold">
      You are not a member of this community
    </p>
  </section>
  <DeleteModal
    :open="leaveCommunityModalOpen"
    title="Leave community"
    delete-text="Leave"
    :is-deleting="isLeaving"
    @cancel="leaveCommunityModalOpen = false"
    @delete="handleLeave"
  >
    <template #body>
      <p>Are you sure you want to leave {{ communityStore.community.name }}?</p>
      <p class="mt-2">If you leave, the following actions will be completed:</p>
      <ul class="list-disc list-inside">
        <li>Any games you have scheduled will be cancelled</li>
        <li>Any RSVPs you have to community games will be cancelled</li>
        <li>You will lose any access or roles you were assigned</li>
      </ul>
    </template>
  </DeleteModal>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import Heading from "@/components/Heading.vue";
import SectionContainer from "@/components/SectionContainer.vue";
import { AccessLevel } from "@/typings/AccessLevel";
import { store } from "@/store";
import { loadUserCommunityAccessLevels } from "@/api/communityAccess";
import { ROLES } from "@/util/roles";
import { communityStore } from "./communityStore";
import { loadUserCommunityMembership } from "@/api/communityMemberships";
import { CommunityMembership } from "@/typings/CommunityMembership";
import WarningButton from "@/components/Buttons/WarningButton.vue";
import DeleteModal from "@/components/Modals/DeleteModal.vue";
import { leaveCommunity } from "@/api/communities";
import useToast from "@/components/Toast/useToast";

const { showSuccess, showError } = useToast();

const loading = ref(true);
const isLeaving = ref(false);
const accessLevels = ref<{ access_level_id: AccessLevel }[]>([]);
const membership = ref<CommunityMembership>();
const leaveCommunityModalOpen = ref(false);

onMounted(async () => {
  await Promise.all([getUserCommunityAccess(), getUserMembership()]);
  loading.value = false;
});

async function getUserCommunityAccess() {
  if (!store.user?.id) return;

  const results = await loadUserCommunityAccessLevels({
    userId: store.user.id,
    communityId: communityStore.community.id,
  });
  if (results) {
    accessLevels.value = results;
  }
}

async function getUserMembership() {
  if (!store.user?.id) return;

  const data = await loadUserCommunityMembership({
    userId: store.user.id,
    communityId: communityStore.community.id,
  });
  if (data) {
    membership.value = data;
  }
}

async function handleLeave() {
  isLeaving.value = true;
  try {
    await leaveCommunity(communityStore.community.id);
    showSuccess({ message: `You have left ${communityStore.community.name}` });
    leaveCommunityModalOpen.value = false;
    membership.value = undefined;
    accessLevels.value = [];
    communityStore.userRoleId = -1;
    communityStore.isAdmin = false;
    communityStore.isCreator = false;
    communityStore.isPlayer = false;
  } catch (error) {
    showError({
      message: "Unable to leave community. Please contact support.",
    });
  } finally {
    isLeaving.value = false;
  }
}
</script>
