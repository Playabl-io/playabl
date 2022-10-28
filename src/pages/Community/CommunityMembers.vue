<template>
  <SectionContainer>
    <Heading level="h6" as="h2" class="mb-2">Members</Heading>
    <p class="text-sm mb-4 text-slate-700">
      Learn more about
      <a
        href="https://docs.playabl.io/communities/managing-members.html"
        class="text-blue-700 underline"
        >managing members</a
      >
    </p>
    <MembersSearch />
  </SectionContainer>
</template>
<script setup lang="ts">
import Heading from "@/components/Heading.vue";
import MembersSearch from "./MembersSearch.vue";
import SectionContainer from "@/components/SectionContainer.vue";
</script>
