<template>
  <DetailPageTemplate :routes="routes">
    <div v-if="isLoading" class="h-full grid place-items-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else>
      <div class="flex items-baseline justify-between mb-6">
        <router-link :to="`/communities/${id}`">
          <Heading level="h1">{{ communityStore.community.name }}</Heading>
        </router-link>
      </div>
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            :key="route.meta.usePathKey ? route.path : undefined"
          />
        </keep-alive>
      </router-view>
    </div>
  </DetailPageTemplate>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { log } from "@/util/logger";
import DetailPageTemplate from "@/layouts/DetailPageTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { ADMIN, CREATOR, PLAYER, ROLES } from "@/util/roles";
import { store } from "@/store";
import { Community } from "@/typings/Community";
import { clearCommunityStore, communityStore } from "./communityStore";
import { getCoverImageUrl } from "@/api/storage";
import { loadUpcomingCommunityGamesWithCount } from "@/api/gamesAndSessions";
import {
  checkForCommunityRequest,
  loadCommunityAdmins,
} from "@/api/communityMemberships";
import {
  getCommunityMemberCount,
  loadCommunityByShortName,
  selectFromCommunity,
} from "@/api/communities";
import { isUuid } from "@/util/uuid";
import { getUpcomingCommunityEvents } from "@/api/communityEvents";
import { triggerUserAccessLoad } from "@/storeActions";

const currentRoute = useRoute();
const router = useRouter();

const communityRoute = computed(
  () => communityStore.community.url_short_name || communityStore.community.id,
);

type navRoute = { label: string; path: string };
type navGroup = { label: string; children: navRoute[] };

const routes = computed(() => {
  const result: (navRoute | navGroup)[] = [
    {
      label: "Overview",
      path: `/communities/${communityRoute.value}/overview`,
    },
    {
      label: "Calendar",
      path: `/communities/${communityRoute.value}/calendar`,
    },
    {
      label: "Events",
      path: `/communities/${communityRoute.value}/events`,
    },
    {
      label: "Membership",
      path: `/communities/${communityRoute.value}/membership`,
    },
  ];
  if (
    store.userCommunityMembership[communityStore.community.id]
      ?.communityMembership.role_id === ROLES.admin
  ) {
    result.push({
      label: "Manage",
      children: [
        {
          label: "Overview",
          path: `/communities/${communityRoute.value}/manage/overview`,
        },
        {
          label: "Access",
          path: `/communities/${communityRoute.value}/manage/access`,
        },
        {
          label: "Info",
          path: `/communities/${communityRoute.value}/manage/info`,
        },
        {
          label: "Integrations",
          path: `/communities/${communityRoute.value}/manage/integrations`,
        },
        {
          label: "Members",
          path: `/communities/${communityRoute.value}/manage/members`,
        },
      ],
    });
  }
  return result;
});

/**
 * This may be a UUID or it may be a short name that was set.
 * We'll confirm in onMounted
 */
const { community_id: id } = currentRoute.params;
const isLoading = ref(true);

onMounted(async () => {
  if (store?.user?.id) {
    triggerUserAccessLoad(store.user.id);
  }
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
  setMembershipStatus();
  await Promise.allSettled([
    getMemberCount(),
    loadUpcomingGames(),
    loadUpcomingEvents(),
    loadAdmins(),
    loadMembershipRequest(),
  ]);
  isLoading.value = false;
  if (
    currentRoute.path.includes("manage") &&
    store.userCommunityMembership[communityStore.community.id]
      ?.communityMembership.role_id !== ROLES.admin
  ) {
    router.replace(`/communities/${id}?unauthorized=true`);
  }
});

onBeforeUnmount(clearCommunityStore);

function setMembershipStatus() {
  if (!store.user) return;

  const membership =
    store.userCommunityMembership?.[communityStore.community.id];

  communityStore.isAdmin = membership?.communityMembership?.role_id === ADMIN;
  communityStore.isCreator =
    membership?.communityMembership?.role_id === CREATOR;
  communityStore.isPlayer = membership?.communityMembership?.role_id === PLAYER;
  communityStore.userRoleId = membership?.communityMembership?.role_id;
}

async function loadMembershipRequest() {
  // if they have a membership, there should not be a request
  if (!store.user || communityStore.userRoleId) return;
  try {
    const request = await checkForCommunityRequest({
      userId: store.user.id,
      communityId: communityStore.community.id,
    });
    if (request) {
      communityStore.membershipRequest = request[0];
    }
  } catch (error) {
    log({ error });
  }
}

async function getCommunity(id: string) {
  const data = (await selectFromCommunity({
    communityId: id,
    select: "*",
  })) as Community;
  setCommunityDataInStore(data);
}

async function setCommunityDataInStore(data: Community) {
  communityStore.community = data;
  if (data?.cover_image) {
    communityStore.coverImageUrl = await getCoverImageUrl(
      data.cover_image,
      true,
    );
  } else {
    communityStore.coverImageUrl = undefined;
  }
}

async function loadUpcomingGames() {
  const { data, count } = await loadUpcomingCommunityGamesWithCount(
    communityStore.community.id,
  );
  if (count !== null) {
    communityStore.gamesCount = count;
  }
  if (data) {
    communityStore.games = data;
  }
}

async function loadUpcomingEvents() {
  const data = await getUpcomingCommunityEvents({
    id: communityStore.community.id,
  });
  communityStore.communityEvents = data;
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
