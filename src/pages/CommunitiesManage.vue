<template>
  <base-template>
    <CommunitiesNav class="mb-12" />
    <section class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
      <CommunityCard
        v-for="community in store.userManagedCommunities"
        :key="community.id"
        :community="community"
        :route="`/communities/${
          community.url_short_name || community.id
        }/manage/overview`"
      />
    </section>
  </base-template>
</template>
<script setup lang="ts">
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import CommunitiesNav from "@/components/Community/CommunitiesNav.vue";
import CommunityCard from "@/components/Community/CommunityCard.vue";
import { store } from "../store";
</script>
