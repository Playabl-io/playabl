<template>
  <SectionContainer>
    <CommunityNameChange />
  </SectionContainer>
  <SectionContainer>
    <CommunityShortName />
  </SectionContainer>
  <SectionContainer>
    <CommunityEmailSettings />
  </SectionContainer>
  <SectionContainer class="grid gap-2">
    <EditCommunityInfo />
  </SectionContainer>
  <SectionContainer>
    <CommunityImageLibrary />
  </SectionContainer>
  <SectionContainer>
    <CalendarCutoff
      :community-id="communityStore.community.id"
      :current-cutoff="communityStore.community.furthest_posting_date"
    />
  </SectionContainer>
  <SectionContainer>
    <AllowPreSeat :community-id="communityStore.community.id" />
  </SectionContainer>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import Heading from "@/components/Heading.vue";
import SectionContainer from "@/components/SectionContainer.vue";
import CalendarCutoff from "./CalendarCutoff.vue";
import { communityStore } from "./communityStore";
import CommunityImageLibrary from "./CommunityImageLibrary.vue";
import EditCommunityInfo from "./EditCommunityInfo.vue";
import CommunityEmailSettings from "./CommunityEmailSettings.vue";
import CommunityShortName from "./CommunityShortName.vue";
import AllowPreSeat from "./AllowPreSeat.vue";
import CommunityNameChange from "./CommunityNameChange.vue";
</script>
