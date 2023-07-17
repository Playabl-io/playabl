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
  <SectionContainer>
    <Heading level="h6" as="h2" class="mb-2">Banned Members</Heading>
    <p class="text-sm mb-4 text-slate-700 max-w-2xl leading-relaxed">
      Email addresses included here will not be shown the option to join or
      request to join the community, and will see they are banned from the
      community
    </p>
    <div class="flex flex-col">
      <FormLabel for="email" no-margin>Email</FormLabel>
      <p class="text-xs text-slate-700 mt-1 mb-2">
        Enter a single email, or a comma separated list
      </p>
      <form class="flex gap-2" @submit.prevent="banEmail">
        <FormInput
          v-model="emailToBan"
          :disabled="isUpdating"
          class="grow"
          name="email"
          required
        />
        <WarningButton
          :disabled="isUpdating"
          variant="outline"
          class="flex-none"
          >Ban</WarningButton
        >
      </form>
      <p class="text-xs text-slate-700 mt-6 mb-1">
        Remove an entry from the ban list by clicking it's removal button
      </p>
      <Well class="max-h-48 overflow-auto">
        <div class="flex flex-wrap gap-4">
          <div
            v-for="email in bannedEmails"
            :key="email"
            class="p-2 flex items-center gap-2 border border-solid border-brand-400 rounded-full text-brand-500"
          >
            <p class="text-xs text-brand-500 font-semibold">{{ email }}</p>
            <DismissButton
              :disabled="isUpdating"
              label="Remove"
              @click="unbanEmail(email)"
            />
          </div>
        </div>
      </Well>
    </div>
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
import FormInput from "@/components/Forms/FormInput.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import WarningButton from "@/components/Buttons/WarningButton.vue";
import Well from "@/components/Well.vue";
import DismissButton from "@/components/Buttons/DismissButton.vue";
import { updateCommunity } from "@/api/communities";
import useToast from "@/components/Toast/useToast";

const { showSuccess, showError } = useToast();

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

const isUpdating = ref(false);
const emailToBan = ref("");
const bannedEmails = ref<string[]>(
  communityStore.community.banned_emails ?? []
);
async function updateBanList(
  nextValue: string[],
  { successMessage }: { successMessage?: string } = {}
) {
  isUpdating.value = true;
  try {
    await updateCommunity({
      communityId: communityStore.community.id,
      update: {
        banned_emails: nextValue,
      },
    });
    showSuccess({ message: successMessage || "Banned emails updated" });
    emailToBan.value = "";
    bannedEmails.value = nextValue;
  } catch (error) {
    showError({ message: "Unable to update banned emails list" });
  } finally {
    isUpdating.value = false;
  }
}
async function banEmail() {
  const values = emailToBan.value.split(",").map((val) => val.trim());
  const nextValue = [
    ...new Set([...values, ...(communityStore.community.banned_emails ?? [])]),
  ];
  await updateBanList(nextValue);
}
async function unbanEmail(email: string) {
  const values = bannedEmails.value.filter((text) => text !== email);
  await updateBanList(values, {
    successMessage: `${email} removed from banned list`,
  });
}
</script>
