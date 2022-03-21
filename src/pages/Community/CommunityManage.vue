<template>
  <section class="flex flex-wrap gap-4">
    <div
      class="w-40 h-40 bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Members</p>
      <p class="text-lg place-self-end font-semibold">
        {{ communityStore.membersCount }}
      </p>
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
  <section class="mt-4">
    <div class="grid lg:grid-cols-3 gap-4">
      <div
        class="grid xl:grid-cols-2 gap-4 grid-flow-row-dense items-start h-min"
        :class="{
          'xl:col-span-2': !expandMembers,
          'col-span-full': expandMembers,
        }"
      >
        <section class="section-container grid gap-2">
          <div class="flex justify-between items-center mb-4 col-span-2">
            <Heading level="h6" as="h2"> Community Info </Heading>
            <GhostButton
              aria-label="Edit community info"
              @click="editInfoDrawerOpen = true"
            >
              <PencilAltIcon class="h-5 w-5 text-slate-700" />
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
            <p class="pt-1 prose dark:prose-invert">{{ detail.label }}</p>
          </div>
        </section>
        <section class="section-container">
          <AccessLevels />
        </section>
        <section class="section-container">
          <CalendarCutoff
            :community-id="communityStore.community.id"
            :current-cutoff="communityStore.community.furthest_posting_date"
          />
        </section>
        <section class="section-container">
          <CommunityImageLibrary />
        </section>
      </div>
      <section
        class="section-container h-min"
        :class="{
          'col-span-full lg:row-start-1': expandMembers,
          'lg:col-span-2 xl:col-span-1': !expandMembers,
        }"
      >
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
                <ArrowsExpandIcon class="h-5 w-5 text-slate-700" />
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
    </div>
    <Drawer :open="editInfoDrawerOpen" @close="editInfoDrawerOpen = false">
      <EditCommunityInfo @close="editInfoDrawerOpen = false" />
    </Drawer>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { useRoute } from "vue-router";
import useToast from "@/components/Toast/useToast";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  PencilAltIcon,
  ArrowsExpandIcon,
  XCircleIcon,
} from "@heroicons/vue/outline";
import Heading from "@/components/Heading.vue";
import { Game } from "@/typings/Game";
import { store } from "@/store";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import AccessLevels from "./AccessLevels.vue";
import InviteLink from "./InviteLink.vue";
import CalendarCutoff from "./CalendarCutoff.vue";
import Drawer from "@/components/Drawer.vue";
import EditCommunityInfo from "./EditCommunityInfo.vue";
import { communityStore } from "./communityStore";
import MembersSearch from "./MembersSearch.vue";
import Tooltip from "@/components/Tooltip.vue";
import CommunityImageLibrary from "./CommunityImageLibrary.vue";

const { showSuccess } = useToast();

const route = useRoute();
const loading = ref(true);
const editInfoDrawerOpen = ref(false);
const expandMembers = ref(false);

const games = ref<Game[]>([]);
const gamesCount = ref(0);
const communityInvites = ref<string[]>([]);
const creatingInvite = ref(false);

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

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    getGames(),
    getMemberAccess(),
    getAccessLevels(),
    getActiveInviteLinks(),
  ]);
  loading.value = false;
});

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
