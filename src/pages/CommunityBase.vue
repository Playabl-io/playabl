<template>
  <BaseTemplate>
    <div v-if="isLoading" class="h-full grid grid-cols-1 place-items-center">
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
            activeClass="border-b border-brand-500 dark:border-brand-300"
          >
            Feed
          </router-link>
          <router-link
            :to="`/communities/${id}/calendar`"
            activeClass="border-b border-brand-500 dark:border-brand-300"
          >
            Calendar
          </router-link>
          <router-link
            v-if="isAdmin"
            :to="`/communities/${id}/manage`"
            activeClass="border-b border-brand-500 dark:border-brand-300"
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
            :community="communityData"
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
import { ADMIN } from "@/util/roles";
import { store } from "@/store";
import { Community } from "@/typings/Community";

const route = useRoute();
const { community_id: id } = route.params;

const communityData = ref<Community>();
const isOwner = ref(false);
const isAdmin = ref(false);
const isLoading = ref(true);

onMounted(async () => {
  await Promise.allSettled([getAdminStatus(), getCommunity()]);
  isLoading.value = false;
});

async function getAdminStatus() {
  if (!store.user) return;
  const { data } = await supabase
    .from("community_memberships")
    .select(`user_id`)
    .eq("community_id", route.params.community_id)
    .eq("role_id", ADMIN)
    .eq("user_id", store.user.id)
    .single();
  if (data) {
    isAdmin.value = true;
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

  if (data) {
    communityData.value = data;
    store.communityInfo = data;
    if (data.owner_id === store.user?.id) {
      isOwner.value = true;
    }
  }
}
</script>
