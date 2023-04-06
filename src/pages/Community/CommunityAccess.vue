<template>
  <SectionContainer>
    <SignupMethod />
  </SectionContainer>
  <SectionContainer>
    <AccessLevels />
  </SectionContainer>
</template>
<script setup lang="ts">
import AccessLevels from "./AccessLevels.vue";
import SignupMethod from "./SignupMethod.vue";
import SectionContainer from "@/components/SectionContainer.vue";
</script>
