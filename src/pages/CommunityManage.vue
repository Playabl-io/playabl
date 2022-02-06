<template>
  <section class="flex space-x-8">
    <div
      class="w-40 h-40 bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Members</p>
      <p class="text-lg place-self-end font-semibold">{{ membersCount }}</p>
    </div>
    <div
      class="w-40 h-40 bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Games</p>
      <p class="text-lg place-self-end font-semibold">{{ gamesCount }}</p>
    </div>
  </section>
  <section class="mt-12">
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 settings-grid items-start"
    >
      <section class="section-container lg:col-span-2 grid grid-cols-2 gap-2">
        <Heading level="h6" as="h2" class="mb-4 col-span-2">
          Community Info
        </Heading>
        <div class="flex items-center space-x-4">
          <CheckCircleIcon
            v-if="community.description"
            class="h-6 w-6"
            :class="{ 'text-blue-700': community.description }"
          />
          <MinusCircleIcon v-else class="h-6 w-6 text-slate-700" />
          <p class="pt-1 prose dark:prose-invert">Description</p>
        </div>
        <div class="flex items-center space-x-4">
          <CheckCircleIcon
            v-if="community.website"
            class="h-6 w-6"
            :class="{ 'text-blue-700': community.website }"
          />
          <MinusCircleIcon v-else class="h-6 w-6 text-slate-700" />
          <p class="pt-1 prose dark:prose-invert">Website</p>
        </div>
        <div class="flex items-center space-x-4">
          <CheckCircleIcon
            v-if="community.twitter"
            class="h-6 w-6"
            :class="{ 'text-blue-700': community.twitter }"
          />
          <MinusCircleIcon v-else class="h-6 w-6 text-slate-700" />
          <p class="pt-1 prose dark:prose-invert">Twitter</p>
        </div>
        <div class="flex items-center space-x-4">
          <CheckCircleIcon
            v-if="community.facebook"
            class="h-6 w-6"
            :class="{ 'text-blue-700': community.facebook }"
          />
          <MinusCircleIcon v-else class="h-6 w-6 text-slate-700" />
          <p class="pt-1 prose dark:prose-invert">Facebook</p>
        </div>
      </section>
      <section class="section-container lg:col-span-2 row-span-2">
        <Heading level="h6" as="h2" class="mb-4">Members</Heading>
        <MemberList />
        <Heading level="h6" as="h2" class="mb-4">Invite Links</Heading>
        <InviteLink
          v-for="invite in communityInvites"
          :key="invite"
          :invite="invite"
          @revoke="revokeInviteLink(invite)"
        />
        <GhostButton
          :is-loading="creatingInvite"
          :disabled="creatingInvite"
          @click="createInviteLink"
          class="w-full mt-6"
        >
          Create new invite link
        </GhostButton>
      </section>
      <section class="section-container md:col-span-2 xl:col-span-2">
        <Heading level="h6" as="h2" class="mb-4">Settings</Heading>
        <AccessLevelList />
      </section>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, PropType, toRefs, computed } from "vue";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { useRoute } from "vue-router";
import useToast from "@/components/Toast/useToast";
import { CheckCircleIcon, MinusCircleIcon } from "@heroicons/vue/outline";
import Heading from "@/components/Heading.vue";
import { Community } from "@/typings/Community";
import AccessLevelList from "@/components/Community/AccessList.vue";
import MemberList from "@/components/Community/MembersList.vue";
import { Game } from "@/typings/Game";
import { MemberWithMembership } from "@/typings/Member";
import { store } from "@/store";
import InviteLink from "@/components/Community/InviteLink.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import { loadCommunityAccessTimes } from "@/api/communityAccess";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});
toRefs(props);

const { showSuccess } = useToast();

const route = useRoute();
const loading = ref(true);

const members = ref<MemberWithMembership[]>([]);
const membersCount = ref(0);
const games = ref<Game[]>([]);
const gamesCount = ref(0);
const communityInvites = ref<string[]>();
const creatingInvite = ref(false);

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    getMembers(),
    getGames(),
    getMemberAccess(),
    getAccessLevels(),
    getActiveInviteLinks(),
  ]);
  loading.value = false;
});

async function getMembers() {
  const { data, error, count } = await supabase
    .from("community_memberships")
    .select("id, role_id (name), user_id (*)", { count: "exact" })
    .eq("community_id", route.params.community_id)
    .neq("user_id", store.user?.id);
  if (count !== null) {
    membersCount.value = count + 1; // adds back the logged in user;
  }
  if (data) {
    const mappedMembers = data.map((membership) => ({
      membershipId: membership.id,
      ...membership.user_id,
      role: membership.role_id.name,
    }));
    store.communityMembers = mappedMembers;
    members.value = mappedMembers;
  }
  if (error) {
    log({ error });
  }
}

async function getMemberAccess() {
  // TODO: do this in a worker since this could be really expensive
  const { data, error } = await supabase
    .from("community_access")
    .select("id, access_level_id (name), user_id (id)")
    .eq("community_id", route.params.community_id);
  if (error) {
    log({ error });
  }
  if (data) {
    const memberAccessMap = data.reduce((acc, access) => {
      if (acc[access.user_id.id]) {
        acc[access.user_id.id].push({
          id: access.id,
          name: access.access_level_id.name,
        });
      } else {
        acc[access.user_id.id] = [
          {
            id: access.id,
            name: access.access_level_id.name,
          },
        ];
      }
      return acc;
    }, {});
    store.communityMemberAccess = memberAccessMap;
  }
}

async function getGames() {
  const { data, error, count } = await supabase
    .from("games")
    .select("*", { count: "exact" })
    .eq("community_id", route.params.community_id);
  if (count) {
    gamesCount.value = count;
  }
  if (data) {
    games.value = data;
  }
  if (error) {
    log({ error });
  }
}

async function getAccessLevels() {
  const data = await loadCommunityAccessTimes(
    route.params.community_id as string
  );
  if (data) {
    store.communityAccessLevels = data;
  }
}

async function getActiveInviteLinks() {
  const { data } = await supabase
    .from("community_invites")
    .select()
    .eq("community_id", route.params.community_id)
    .eq("is_revoked", false);
  communityInvites.value = data?.map((invite) => invite.id);
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
    communityInvites.value?.concat(data.id);
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
</script>
<style scoped>
.section-container {
  @apply border border-solid border-gray-300 p-4 rounded-lg;
}
</style>
