<template>
  <BaseTemplate>
    <div v-if="isLoading" class="h-full grid place-items-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-else>
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
          <router-link
            v-if="communityStore.isAdmin"
            :to="`/communities/${id}/settings`"
            active-class="border-b border-brand-500 dark:border-brand-300"
          >
            Settings
          </router-link>
        </div>
      </section>
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            :key="route.meta.usePathKey ? route.path : undefined"
            :community="communityStore.community"
          />
        </keep-alive>
      </router-view>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
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

const route = useRoute();
const { community_id: id } = route.params;

const communityData = ref<Community>();
const isOwner = ref(false);
const isLoading = ref(true);

onMounted(async () => {
  if (typeof route.params.community_id === "string") {
    getMemberCount(route.params.community_id);
    getGames(route.params.community_id);
  }
  await Promise.allSettled([getMembershipStatus(), getCommunity()]);
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
  if (data && data.role_id === ADMIN) {
    communityStore.isAdmin = true;
  }
  if (data && data.role_id === CREATOR) {
    communityStore.isCreator = true;
  }
  if (data && data.role_id === PLAYER) {
    communityStore.isPlayer = true;
  }
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
    getCoverImageUrl(data.cover_image);
  }

  if (data) {
    communityData.value = data;
    communityStore.community = data;
    if (data.owner_id === store.user?.id) {
      isOwner.value = true;
    }
  }
}
</script>
