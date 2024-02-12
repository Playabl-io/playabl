<template>
  <BaseTemplate>
    <section class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <CommunityCard
        v-for="entry in store.userCommunityMembership"
        :key="entry.community.id"
        :community="entry.community"
      />
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { store } from "../store";
import CommunityCard from "@/components/Community/CommunityCard.vue";
</script>
