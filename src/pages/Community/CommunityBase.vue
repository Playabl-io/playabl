<template>
  <BaseTemplate>
    <div v-if="isLoading" class="h-full grid place-items-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else>
      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <InfoBanner
          v-if="currentRoute.query.unauthorized"
          class="mb-6"
          @dismiss="router.replace(currentRoute.path)"
        >
          You are not authorized to view that page
        </InfoBanner>
      </transition>
      <div class="flex items-baseline justify-between">
        <router-link :to="`/communities/${id}`">
          <Heading level="h1">{{ communityData?.name }}</Heading>
        </router-link>
      </div>
      <CommunityNav />
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            :key="route.meta.usePathKey ? route.path : undefined"
          />
        </keep-alive>
      </router-view>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import CommunityNav from "./CommunityNav.vue";
import { log } from "@/util/logger";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { ADMIN, CREATOR, PLAYER } from "@/util/roles";
import { store } from "@/store";
import { Community } from "@/typings/Community";
import { clearCommunityStore, communityStore } from "./communityStore";
import { getCoverImageUrl } from "@/api/storage";
import InfoBanner from "@/components/Banners/InfoBanner.vue";
import { loadUpcomingCommunityGamesWithCount } from "@/api/gamesAndSessions";
import {
  loadCommunityAdmins,
  loadUserCommunityMembership,
} from "@/api/communityMemberships";
import {
  getCommunityMemberCount,
  loadCommunityByShortName,
  selectFromCommunity,
} from "@/api/communities";
import { isUuid } from "@/util/uuid";

const currentRoute = useRoute();
const router = useRouter();

/**
 * This may be a UUID or it may be a short name that was set.
 * We'll confirm in onMounted
 */
const { community_id: id } = currentRoute.params;

const communityData = ref<Community>();
const isLoading = ref(true);

onMounted(async () => {
  if (typeof id !== "string") throw new Error("Unusable community id param");
  if (!isUuid(id)) {
    const data = (await loadCommunityByShortName({
      shortName: id,
      select: "*",
    })) as Community;
    if (!data) {
      router.replace("/not-found");
      return;
    }
    setCommunityDataInStore(data);
  } else {
    await getCommunity(id);
  }
  await Promise.allSettled([
    getMemberCount(),
    getMembershipStatus(),
    loadUpcomingGames(),
    loadAdmins(),
  ]);
  if (currentRoute.path.includes("manage") && !communityStore.isAdmin) {
    router.replace(`/communities/${id}?unauthorized=true`);
  }
  isLoading.value = false;
});

onBeforeUnmount(clearCommunityStore);

async function getMembershipStatus() {
  if (!store.user) return;

  const data = await loadUserCommunityMembership({
    communityId: communityStore.community.id,
    userId: store.user.id,
  });
  if (!data) return;
  communityStore.isAdmin = data.role_id === ADMIN;
  communityStore.isCreator = data.role_id === CREATOR;
  communityStore.isPlayer = data.role_id === PLAYER;
  communityStore.userRoleId = data.role_id;
}

async function getCommunity(id: string) {
  const data = (await selectFromCommunity({
    communityId: id,
    select: "*",
  })) as Community;
  setCommunityDataInStore(data);
}

async function setCommunityDataInStore(data: Community) {
  communityData.value = data;
  communityStore.community = data;
  if (data?.cover_image) {
    communityStore.coverImageUrl = await getCoverImageUrl(data.cover_image);
  } else {
    communityStore.coverImageUrl = undefined;
  }
}

async function loadUpcomingGames() {
  const { data, count } = await loadUpcomingCommunityGamesWithCount(
    communityStore.community.id
  );
  if (count !== null) {
    communityStore.gamesCount = count;
  }
  if (data) {
    communityStore.games = data;
  }
}

async function loadAdmins() {
  const data = await loadCommunityAdmins(communityStore.community.id);
  if (data) {
    communityStore.admins = data;
  }
}

async function getMemberCount() {
  const id = communityStore.community.id;
  const { error, count } = await getCommunityMemberCount(id);
  if (count !== null) {
    communityStore.membersCount = count;
  }
  if (error) {
    log({ error });
  }
}
</script>
