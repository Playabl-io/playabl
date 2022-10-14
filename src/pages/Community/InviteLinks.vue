<template>
  <div class="flex flex-col">
    <Heading level="h6" as="h2">Invite Links</Heading>
    <p class="text-xs text-slate-700 mt-1 mb-4">Click to copy</p>
    <div class="grow">
      <InviteLink
        v-for="invite in communityInvites"
        :key="invite"
        :invite="invite"
        @revoke="revokeInviteLink(invite)"
      />
    </div>
    <GhostButton
      :is-loading="creatingInvite"
      :disabled="creatingInvite"
      class="w-full mt-4"
      @click="createInviteLink"
    >
      Create new invite link
    </GhostButton>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import Heading from "@/components/Heading.vue";
import InviteLink from "./InviteLink.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import useToast from "@/components/Toast/useToast";
import { supabase } from "@/supabase";
import { useRoute } from "vue-router";

const emit = defineEmits(["loadFinished"]);
const route = useRoute();
const { showSuccess } = useToast();

const communityInvites = ref<string[]>([]);
const creatingInvite = ref(false);

async function getActiveInviteLinks() {
  const { data } = await supabase
    .from("community_invites")
    .select()
    .eq("community_id", route.params.community_id)
    .eq("is_revoked", false);
  if (data) {
    communityInvites.value = data.map((invite) => invite.id);
  }
}

async function createInviteLink() {
  creatingInvite.value = true;
  const { data } = await supabase
    .from("community_invites")
    .insert({
      community_id: route.params.community_id,
    })
    .single();
  if (data) {
    communityInvites.value = communityInvites.value?.concat(data.id);
    showSuccess({ message: "Invite link created!" });
  }
  creatingInvite.value = false;
}

async function revokeInviteLink(id: string) {
  const { data } = await supabase
    .from("community_invites")
    .update({
      is_revoked: true,
    })
    .match({ id })
    .single();
  if (data) {
    communityInvites.value = communityInvites.value?.filter(
      (link) => link !== id
    );
    showSuccess({ message: "Invite link revoked" });
  }
}

onMounted(async () => {
  await getActiveInviteLinks();
  emit("loadFinished");
});
</script>
