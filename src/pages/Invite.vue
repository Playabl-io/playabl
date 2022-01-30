<template>
  <BaseTemplate>
    <div class="grid place-items-center">
      <LoadingSpinner v-if="isLoading" color="brand-500" />
      <div v-else-if="!store.user?.id">
        You need to sign in to accept an invite.
      </div>
      <div v-else-if="inviteInfo?.is_revoked">
        <p>
          Sorry, that invite isn't valid. Please contact the community admin.
        </p>
      </div>
      <div v-else-if="alreadyJoined">
        <p>You are already a member of this community</p>
      </div>
      <div v-else>
        <p>
          You've been invited to join
          <span class="font-semibold">
            {{ inviteInfo?.community_id.name }}
          </span>
        </p>
        <PrimaryButton
          class="w-full mt-4"
          @click="joinCommunity"
          :is-loading="joining"
          :disabled="joining"
        >
          Join now
        </PrimaryButton>
      </div>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import BaseTemplate from "@/components/BaseTemplate.vue";
import { store } from "@/store";
import { supabase } from "@/supabase";
import { onMounted, ref } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { ROLES } from "@/util/roles";
import useToast from "@/components/Toast/useToast";

const { showSuccess, showError } = useToast();

const route = useRoute();
const router = useRouter();

const inviteInfo = ref<{
  is_revoked: boolean;
  community_id: { name: string; id: string };
}>();
const isLoading = ref(false);
const joining = ref(false);
const alreadyJoined = ref(false);

async function loadCommunityInvite() {
  const { data, error } = await supabase
    .from("community_invites")
    .select("is_revoked, community_id (name, id)")
    .eq("id", route.params.invite_id)
    .single();
  if (data) {
    inviteInfo.value = data;
  }
}

async function checkCommunityMember() {
  const { data } = await supabase
    .from("community_memberships")
    .select()
    .eq("user_id", store.user?.id)
    .eq("community_id", inviteInfo.value?.community_id.id)
    .single();
  if (data) {
    alreadyJoined.value = true;
  }
}

async function joinCommunity() {
  joining.value = true;
  const { data } = await fetch(
    `/.netlify/functions/joinThroughInviteLink?inviteId=${route.params.invite_id}&userId=${store.user?.id}&communityId=${inviteInfo.value?.community_id.id}`
  )
    .then((response) => response.json())
    .catch(() => {
      showError({ message: "Sorry, something went wrong" });
    });

  if (data) {
    showSuccess({ message: "Welcome to the community" });
    router.push(`/communities/${data.community_id}`);
  }

  joining.value = false;
}

onMounted(async () => {
  isLoading.value = true;
  if (!store.user?.id) {
    isLoading.value = false;
    return;
  }
  await loadCommunityInvite();
  await checkCommunityMember();
  isLoading.value = false;
});
</script>
