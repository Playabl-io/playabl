<template>
  <button class="hover:cursor-pointer rounded-full relative">
    <UserAvatar
      :avatar-url="avatarUrl"
      :username="usernameOrEmail"
      @click="showPlayerHistory = true"
    />
    <HeartIcon
      v-if="isNewMember"
      class="absolute top-0 right-0 text-red-500 w-5 h-5"
    />
  </button>

  <BaseModal
    title="Your history together"
    :open="showPlayerHistory"
    @close="showPlayerHistory = false"
  >
    <DismissButton
      label="close"
      class="absolute top-4 right-4"
      @click="showPlayerHistory = false"
    />
    <slot name="body">
      <PlayerHistoryTooltipContent :player-history="playerHistory" />
    </slot>
  </BaseModal>
</template>
<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import UserAvatar from "@/components/UserAvatar.vue";
import { playerHistoryType } from "../IndexPage.vue";
import { supabase } from "@/supabase";
import { store } from "@/store";
import useSWRV from "swrv";
import { CommunityMembership } from "@/typings/CommunityMembership";
import { differenceInCalendarMonths } from "date-fns";
import { HeartIcon } from "@heroicons/vue/24/solid";
import PlayerHistoryTooltipContent from "@/components/PlayerHistoryTooltipContent.vue";
import BaseModal from "@/components/Modals/BaseModal.vue";
import DismissButton from "@/components/Buttons/DismissButton.vue";

const showPlayerHistory = ref(false);

const props = defineProps({
  avatarUrl: {
    type: String,
    default: undefined,
  },
  usernameOrEmail: {
    type: String,
    required: true,
  },
  playerHistory: {
    type: Object as PropType<playerHistoryType>,
    required: true,
  },
  communityId: {
    type: String,
    required: false,
    default: "",
  },
  position: {
    type: String,
    default: "top",
  },
  showNewMemberStatus: {
    type: Boolean,
    default: false,
  },
});

const { data } = useSWRV<CommunityMembership>(
  `${props.communityId}-${store.user?.id}`,
  loadMembership,
);

const isNewMember = computed(() => {
  if (data?.value?.created_at) {
    return (
      differenceInCalendarMonths(new Date(), new Date(data.value.created_at)) <
      3
    );
  }
  return false;
});

async function loadMembership() {
  if (props.showNewMemberStatus) {
    const { data } = await supabase
      .from("community_memberships")
      .select("*")
      .eq("user_id", store.user?.id ?? "")
      .eq("community_id", props.communityId)
      .single();
    return data;
  }
}
</script>
