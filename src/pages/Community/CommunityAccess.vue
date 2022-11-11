<template>
  <SectionContainer>
    <CommunityStripe />
  </SectionContainer>
  <SectionContainer>
    <PublicAccess />
  </SectionContainer>
  <SectionContainer>
    <AccessLevels />
  </SectionContainer>
</template>
<script setup lang="ts">
import AccessLevels from "./AccessLevels.vue";
import PublicAccess from "./PublicAccess.vue";
import CommunityStripe from "./CommunityStripe.vue";
import SectionContainer from "@/components/SectionContainer.vue";
</script>
