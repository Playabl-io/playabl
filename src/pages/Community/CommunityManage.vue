<template>
  <section class="flex flex-wrap gap-8">
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
    <div class="section-container grow flex flex-col">
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
  </section>
  <section class="mt-4 md:mt-12">
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 grid-flow-row-dense">
      <section class="section-container grid grid-cols-2 gap-2">
        <div class="flex justify-between items-center mb-4 col-span-2">
          <Heading level="h6" as="h2"> Community Info </Heading>
          <!-- <GhostButton>
            <PencilAltIcon class="h-5 w-5" />
          </GhostButton> -->
        </div>
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
      <section
        class="section-container row-span-2 md:col-start-2 xl:col-start-3"
      >
        <Heading level="h6" as="h2" class="mb-4">Members</Heading>
        <MembersList :community-id="community.id" />
      </section>
      <section class="section-container row-span-2">
        <AccessLevels />
      </section>
      <section class="section-container">
        <CalendarCutoff
          :community-id="community.id"
          :current-cutoff="community.furthest_posting_date"
        />
      </section>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, PropType, toRefs } from "vue";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { useRoute } from "vue-router";
import useToast from "@/components/Toast/useToast";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  PencilAltIcon,
} from "@heroicons/vue/outline";
import Heading from "@/components/Heading.vue";
import { Community } from "@/typings/Community";
import { Game } from "@/typings/Game";
import { MemberWithMembership } from "@/typings/Member";
import { store } from "@/store";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import AccessLevels from "./AccessLevels.vue";
import MembersList from "./MembersList.vue";
import InviteLink from "./InviteLink.vue";
import CalendarCutoff from "./CalendarCutoff.vue";

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
const communityInvites = ref<string[]>([]);
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
    .eq("community_id", route.params.community_id);
  if (count !== null) {
    membersCount.value = count;
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
</script>
<style scoped>
.section-container {
  @apply border border-solid border-gray-300 p-4 rounded-lg;
}
</style>
