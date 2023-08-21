<template>
  <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
    <DataTile title="Members" :value="communityStore.membersCount" />
    <DataTile title="Upcoming Games" :value="communityStore.gamesCount" />
  </div>
  <SectionContainer>
    <InviteLinks />
  </SectionContainer>
</template>
<script setup lang="ts">
import SectionContainer from "@/components/SectionContainer.vue";
import { communityStore } from "./communityStore";
import InviteLinks from "./InviteLinks.vue";
import DataTile from "@/components/Data/DataTile.vue";
</script>
