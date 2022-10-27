<template>
  <section class="section-container">
    <div class="flex justify-between">
      <Heading level="h6" as="h2" class="mb-4">Members</Heading>
      <Tooltip v-if="!expandMembers">
        <template #tooltip>
          <p class="w-24">Expand for more search options</p>
        </template>
        <template #trigger="{ toggleTooltip }">
          <GhostButton
            @click="expandMembers = true"
            @mouseenter="toggleTooltip"
            @mouseleave="toggleTooltip"
            @focus="toggleTooltip"
            @blur="toggleTooltip"
          >
            <ArrowsPointingOutIcon class="h-5 w-5 text-slate-700" />
          </GhostButton>
        </template>
      </Tooltip>
      <Tooltip v-else>
        <template #tooltip> Collapse </template>
        <template #trigger="{ toggleTooltip }">
          <GhostButton
            @click="expandMembers = false"
            @mouseenter="toggleTooltip"
            @mouseleave="toggleTooltip"
            @focus="toggleTooltip"
            @blur="toggleTooltip"
          >
            <XCircleIcon class="h-5 w-5 text-slate-700" />
          </GhostButton>
        </template>
      </Tooltip>
    </div>
    <MembersSearch :expanded="expandMembers" />
  </section>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { ArrowsPointingOutIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import Heading from "@/components/Heading.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import MembersSearch from "./MembersSearch.vue";
import Tooltip from "@/components/Tooltip.vue";

const expandMembers = ref(true);
</script>
<style scoped>
.section-container {
  @apply border border-solid border-gray-300 p-4 rounded-lg;
}
</style>
