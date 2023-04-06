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
  <SectionContainer>
    <Heading level="h6" as="h2" class="mb-2">Membership Requests</Heading>
    <MembershipRequestItem
      v-for="request in requests"
      :key="request.id"
      :request="request"
      @remove="removeRequest"
    />
    <p v-if="requests.length === 0" class="text-sm">No pending requests</p>
  </SectionContainer>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import Heading from "@/components/Heading.vue";
import MembersSearch from "./MembersSearch.vue";
import SectionContainer from "@/components/SectionContainer.vue";
import { CommunityMembershipRequest } from "@/typings/CommunityMembership";
import { loadCommunityRequests } from "@/api/communityMemberships";
import MembershipRequestItem from "./MembershipRequestItem.vue";
import { communityStore } from "./communityStore";

const requests = ref<CommunityMembershipRequest[]>([]);

onMounted(async () => {
  const data = await loadCommunityRequests({
    communityId: communityStore.community.id,
  });
  requests.value = data;
});

function removeRequest(requestId: number) {
  requests.value = requests.value.filter((request) => request.id !== requestId);
}
</script>
