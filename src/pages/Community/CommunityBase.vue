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
          v-if="route.query.unauthorized"
          class="mb-6"
          @dismiss="router.replace(route.path)"
        >
          You are not authorized to view that page
        </InfoBanner>
      </transition>
      <div class="flex items-baseline justify-between">
        <router-link :to="`/communities/${id}`">
          <Heading level="h1">{{ communityData?.name }}</Heading>
        </router-link>
      </div>
      <section class="my-12 flex justify-between items-baseline text-sm">
        <div class="flex space-x-4 py-2">
          <router-link
            :to="`/communities/${id}`"
            exact-active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Home
          </router-link>
          <router-link
            v-if="store.user"
            :to="`/communities/${id}/feed`"
            active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Feed
          </router-link>
          <router-link
            :to="`/communities/${id}/calendar`"
            active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Calendar
          </router-link>
          <router-link
            v-if="communityStore.isAdmin"
            :to="`/communities/${id}/manage`"
            active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Manage
          </router-link>
        </div>
      </section>
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { ADMIN, CREATOR, PLAYER } from "@/util/roles";
import { store } from "@/store";
import { Community } from "@/typings/Community";
import { communityStore, getGames, getMemberCount } from "./communityStore";
import { getCoverImageUrl } from "@/api/storage";
import InfoBanner from "@/components/Banners/InfoBanner.vue";

const route = useRoute();
const router = useRouter();
const { community_id: id } = route.params;

const communityData = ref<Community>();
const isLoading = ref(true);

onMounted(async () => {
  if (typeof route.params.community_id === "string") {
    getMemberCount(route.params.community_id);
    getGames(route.params.community_id);
  }
  await Promise.allSettled([getMembershipStatus(), getCommunity()]);
  if (route.path.includes("manage") && !communityStore.isAdmin) {
    router.replace(`/communities/${id}?unauthorized=true`);
  }
  isLoading.value = false;
});

async function getMembershipStatus() {
  if (!store.user) return;
  const { data } = await supabase
    .from("community_memberships")
    .select(`user_id, role_id`)
    .eq("community_id", route.params.community_id)
    .eq("user_id", store.user.id)
    .single();
  communityStore.isAdmin = data && data.role_id === ADMIN;
  communityStore.isCreator = data && data.role_id === CREATOR;
  communityStore.isPlayer = data && data.role_id === PLAYER;
}

async function getCommunity() {
  const { data, error, status } = await supabase
    .from("communities")
    .select()
    .eq("id", id)
    .single();

  if (error && status !== 406) {
    log({ error });
  }

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
</script>
