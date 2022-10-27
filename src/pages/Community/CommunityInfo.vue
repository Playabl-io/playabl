<template>
  <SectionContainer class="grid gap-2">
    <div class="flex justify-between items-center mb-4 col-span-2">
      <Heading level="h6" as="h2"> Community Info </Heading>
      <GhostButton
        aria-label="Edit community info"
        @click="editInfoDrawerOpen = true"
      >
        <PencilSquareIcon class="h-5 w-5 text-slate-700" />
      </GhostButton>
    </div>
    <div
      v-for="detail in details"
      :key="detail.label"
      class="flex items-center space-x-4"
    >
      <CheckCircleIcon
        v-if="detail.value"
        class="h-6 w-6"
        :class="{ 'text-blue-700': detail.value }"
      />
      <MinusCircleIcon v-else class="h-6 w-6 text-slate-700" />
      <p class="prose dark:prose-invert">{{ detail.label }}</p>
    </div>
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
  <SideDrawer :open="editInfoDrawerOpen" @close="editInfoDrawerOpen = false">
    <EditCommunityInfo @close="editInfoDrawerOpen = false" />
  </SideDrawer>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  PencilSquareIcon,
} from "@heroicons/vue/24/outline";
import Heading from "@/components/Heading.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import SectionContainer from "@/components/SectionContainer.vue";
import CalendarCutoff from "./CalendarCutoff.vue";
import { communityStore } from "./communityStore";
import CommunityImageLibrary from "./CommunityImageLibrary.vue";
import SideDrawer from "@/components/SideDrawer.vue";
import EditCommunityInfo from "./EditCommunityInfo.vue";

const editInfoDrawerOpen = ref(false);

const details = computed(() => [
  { value: communityStore.community.description, label: "Description" },
  { value: communityStore.community.website, label: "Website" },
  {
    value: communityStore.community.code_of_conduct_url,
    label: "Code of conduct",
  },
  { value: communityStore.community.twitter, label: "Twitter" },
  { value: communityStore.community.facebook, label: "Facebook" },
  { value: communityStore.community.discord, label: "Discord" },
  { value: communityStore.community.slack, label: "Slack" },
  { value: communityStore.community.patreon, label: "Patreon" },
]);
</script>
