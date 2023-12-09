<template>
  <BaseModal :open="open" title="Pre-seat a member" @close="emit('close')">
    <p class="mb-3">
      Search for the member you want to pre-seat. Once found, click on the
      member to select sessions to add them to. Repeat as needed.
    </p>
    <form v-if="!selectedMember" @submit.prevent="search">
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
      <template v-if="selectedMember">
        <p class="text-xs mb-3">
          Select which sessions to add them to. Click Select New to add sessions
          to another user.
        </p>
        <div class="flex gap-3">
          <div
            class="grow p-3 bg-white hover:bg-neutral-50 hover:shadow-md rounded-md cursor-pointer transition-all duration-150 ease-in-out"
          >
            <UserBadge
              :username="selectedMember.username"
              :email="selectedMember.email"
              :avatar-url="selectedMember.avatar_url"
              :pronouns="selectedMember.pronouns"
              size="small"
            />
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-3 mt-4">
          <button
            v-for="(session, i) in sessions"
            :key="session.id"
            class="rounded-lg p-4 shadow-sm text-left transition-all"
            :class="[
              preSeatAssignments[session.id]?.members.some(
                (member) => member.id === selectedMember?.id,
              )
                ? 'bg-green-100'
                : 'bg-white',
            ]"
            @click="
              () => preSeatMember({ id: session.id, member: selectedMember! })
            "
          >
            <p class="text-xs text-slate-700 font-semibold mb-3">
              Session {{ i + 1 }}
            </p>

            <div class="flex flex-col mb-3">
              <p class="text-sm">Start time</p>
              <p>
                {{
                  format(new Date(session.start_time), "EEE, MMM do, h:mm a")
                }}
              </p>
            </div>
            <div class="flex flex-col">
              <p class="text-sm">End time</p>
              <p>
                {{ format(new Date(session.end_time), "EEE, MMM do, h:mm a") }}
              </p>
            </div>
            <p class="text-sm mt-3">Pre-Seated</p>
            <div class="flex flex-wrap gap-2">
              <p class="">
                {{
                  preSeatAssignments[session.id]?.members
                    .map((member) => member.username || member.email)
                    .join(", ")
                }}
              </p>
            </div>
          </button>
        </div>
      </template>
      <template v-else>
        <p class="text-xs mb-3">Top 10 results for your search are shown</p>
        <ul class="grid gap-4">
          <li v-for="member in results" :key="member.id">
            <button
              class="w-full p-3 bg-white hover:bg-neutral-50 hover:shadow-md rounded-md cursor-pointer transition-all duration-150 ease-in-out"
              @click="selectedMember = member"
            >
              <UserBadge
                :username="member.username"
                :email="member.email"
                :avatar-url="member.avatar_url"
                :pronouns="member.pronouns"
                size="small"
              />
            </button>
          </li>
        </ul>
      </template>
    </div>
    <div class="flex justify-end mt-6 gap-3">
      <BaseButton
        v-if="selectedMember"
        class="bg-blue-100"
        @click="selectedMember = undefined"
      >
        <ArrowUturnLeftIcon class="w-5 h-5 mr-2 text-blue-900" />
        <p class="text-blue-700 font-semibold">Select new</p>
      </BaseButton>
      <GhostButton @click="emit('close')">Close</GhostButton>
    </div>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { format } from "date-fns";
import {
  ArrowUturnLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import GhostButton from "../Buttons/GhostButton.vue";
import FormInput from "../Forms/FormInput.vue";
import FormLabel from "../Forms/FormLabel.vue";
import BaseModal from "./BaseModal.vue";
import { searchForAMember } from "@/api/communityMemberships";
import { Member } from "@/typings/Member";
import UserBadge from "../UserBadge.vue";
import BaseButton from "../Buttons/BaseButton.vue";
import { store } from "@/store";

const props = defineProps<{
  open: boolean;
  communityId: string;
  sessions: { id: string; start_time: number; end_time: number }[];
  preSeatAssignments: { [id: string]: { members: Member[] } };
}>();

const emit = defineEmits<{
  save: [{ [id: string]: { members: Member[] } }];
  close: [];
}>();

const searchTerm = ref("");
const results = ref<Member[]>([]);
const selectedMember = ref<Member>();

async function search() {
  const { data } = await searchForAMember({
    communityId: props.communityId,
    searchTerm: searchTerm.value,
    from: 0,
    to: 10,
  });

  results.value = data?.filter((user) => user.id !== store.user?.id) || [];
}

function preSeatMember({ member, id }: { member: Member; id: string }) {
  const nextAssignments = { ...props.preSeatAssignments };
  if (nextAssignments[id]) {
    const isAlreadySeated = nextAssignments[id].members.some(
      (val) => val.id === member.id,
    );
    nextAssignments[id].members = isAlreadySeated
      ? nextAssignments[id].members.filter((val) => val.id !== member.id)
      : nextAssignments[id].members.concat(member);
  } else {
    nextAssignments[id] = {
      members: [member],
    };
  }
  emit("save", nextAssignments);
}
</script>
