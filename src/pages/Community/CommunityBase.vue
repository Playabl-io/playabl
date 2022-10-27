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
import BaseTemplate from "@/components/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { ADMIN, CREATOR, PLAYER } from "@/util/roles";
import { store } from "@/store";
import { Community } from "@/typings/Community";
import {
  clearCommunityStore,
  communityStore,
  getMemberCount,
} from "./communityStore";
import { getCoverImageUrl } from "@/api/storage";
import InfoBanner from "@/components/Banners/InfoBanner.vue";
import { loadUpcomingCommunityGamesWithCount } from "@/api/gamesAndSessions";
import {
  loadCommunityAdmins,
  loadUserCommunityMembership,
} from "@/api/communityMemberships";
import { selectFromCommunity } from "@/api/communities";

const currentRoute = useRoute();
const router = useRouter();
const { community_id: id } = currentRoute.params;

const communityData = ref<Community>();
const isLoading = ref(true);

onMounted(async () => {
  if (typeof currentRoute.params.community_id === "string") {
    getMemberCount(currentRoute.params.community_id);
  }
  await Promise.allSettled([
    getMembershipStatus(),
    getCommunity(),
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
  let communityId = "";
  if (typeof currentRoute.params.community_id === "string") {
    communityId = currentRoute.params.community_id;
  }
  const data = await loadUserCommunityMembership({
    communityId,
    userId: store.user.id,
  });
  communityStore.isAdmin = data.role_id === ADMIN;
  communityStore.isCreator = data.role_id === CREATOR;
  communityStore.isPlayer = data.role_id === PLAYER;
}

async function getCommunity() {
  if (typeof id === "string") {
    const data = await selectFromCommunity({ communityId: id, select: "*" });

    if (data.cover_image) {
      communityStore.coverImageUrl = await getCoverImageUrl(data.cover_image);
    } else {
      communityStore.coverImageUrl = undefined;
    }

    if (data) {
      communityData.value = data;
      communityStore.community = data;
    }
  }
}

async function loadUpcomingGames() {
  if (typeof id === "string") {
    const { data, count } = await loadUpcomingCommunityGamesWithCount(id);
    if (count !== null) {
      communityStore.gamesCount = count;
    }
    if (data) {
      communityStore.games = data;
    }
  } else {
    log({
      level: "error",
      message: "Community ID is array of strings in loadUpcomingGames",
    });
  }
}

async function loadAdmins() {
  if (typeof id === "string") {
    const data = await loadCommunityAdmins(id);
    if (data) {
      communityStore.admins = data;
    }
  }
}
</script>
