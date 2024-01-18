<template>
  <BaseModal :open="open" title="Member search" @close="emit('close')">
    <form @submit.prevent="search">
      <div class="flex flex-col">
        <FormLabel>Search term (display name or email)</FormLabel>
        <div class="flex gap-2">
          <FormInput v-model="searchTerm" class="grow"></FormInput>
          <GhostButton>
            <MagnifyingGlassIcon class="w-5 h-5 text-slate-700" />
          </GhostButton>
        </div>
      </div>
    </form>
    <div class="mt-4 p-3 rounded-md bg-gray-200 overflow-auto">
      <p class="text-xs mb-3">Top 10 results for your search are shown</p>
      <ul class="grid gap-4">
        <li v-for="member in results" :key="member.id">
          <button
            class="w-full p-3 bg-white hover:bg-neutral-50 hover:shadow-md rounded-md cursor-pointer transition-all duration-150 ease-in-out flex justify-between items-center border-2 border-solid"
            :class="[
              selectedMember?.id === member.id
                ? 'border-green-500'
                : 'border-transparent',
            ]"
            @click="selectedMember = member"
          >
            <UserBadge
              :username="member.username"
              :email="member.email"
              :avatar-url="member.avatar_url"
              :pronouns="member.pronouns"
              size="small"
            />
            <CheckCircleIcon
              v-if="selectedMember?.id === member.id"
              class="w-6 h-6 text-green-500"
            />
          </button>
        </li>
      </ul>
    </div>
    <div class="flex justify-between mt-6 gap-3">
      <GhostButton @click="emit('cancel')">Cancel</GhostButton>
      <div v-if="selectedMember" class="flex gap-2">
        <GhostButton class="text-red-700" @click="selectedMember = undefined">
          <ArrowUturnDownIcon class="w-5 h-5 mr-2" />
          <p class="">Clear selected member</p>
        </GhostButton>
        <PrimaryButton @click="handleSelect"> Continue </PrimaryButton>
      </div>
    </div>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref } from "vue";
import {
  ArrowUturnDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import GhostButton from "../Buttons/GhostButton.vue";
import FormInput from "../Forms/FormInput.vue";
import FormLabel from "../Forms/FormLabel.vue";
import BaseModal from "./BaseModal.vue";
import { searchForAMember } from "@/api/communityMemberships";
import { Profile } from "@/typings/Profile";
import UserBadge from "../UserBadge.vue";
import { store } from "@/store";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";
import PrimaryButton from "../Buttons/PrimaryButton.vue";

const props = defineProps<{
  open: boolean;
  communityId: string;
}>();

const emit = defineEmits<{
  select: [Profile];
  cancel: [];
}>();

const searchTerm = ref("");
const results = ref<Profile[]>([]);
const selectedMember = ref<Profile>();

async function search() {
  const { data } = await searchForAMember({
    communityId: props.communityId,
    searchTerm: searchTerm.value,
    from: 0,
    to: 10,
  });

  results.value = data?.filter((user) => user.id !== store.user?.id) || [];
}

function handleSelect() {
  if (selectedMember.value) {
    emit("select", selectedMember.value);
    selectedMember.value = undefined;
    searchTerm.value = "";
    results.value = [];
  }
}
</script>
