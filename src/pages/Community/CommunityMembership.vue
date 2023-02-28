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
  </section>
  <section v-else>
    <p class="text-center font-semibold">
      You are not a member of this community
    </p>
    <SectionContainer>
      <Heading as="h2" level="h6">Membership Requests</Heading>
    </SectionContainer>
  </section>
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

const loading = ref(true);
const accessLevels = ref<{ access_level_id: AccessLevel }[]>([]);
const membership = ref<CommunityMembership>();
const requests = ref([]);

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
</script>
