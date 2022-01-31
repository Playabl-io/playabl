<template>
  <div class="h-full relative">
    <div class="grid gap-8 auto-rows-auto">
      <section class="px-6 pt-6">
        <Heading level="h6" as="h2" class="mb-6">
          Edit {{ possessive(member.username) }} role and access
        </Heading>
        <div class="flex flex-col relative">
          <FormLabel for="role">Role</FormLabel>
          <select
            :value="member.role"
            class="rounded-md border border-solid border-gray-300 text-slate-900 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
            @change="handleRoleUpdate($event)"
            id="role"
            :disabled="updatingRole"
          >
            <option value="Admin">Admin</option>
            <option value="Creator">Creator</option>
            <option value="Player">Player</option>
          </select>
        </div>
      </section>
      <hr />
      <section class="px-6">
        <Heading level="h6" as="h3">Access</Heading>
        <div
          class="rounded-md border border-solid border-gray-500 p-2 mt-4"
          :class="{
            'bg-gray-300 opacity-60': removingAccess,
          }"
        >
          <p class="text-xs text-slate-700 mb-2">Current</p>
          <div class="grid grid-cols-2 gap-2">
            <LinkButton
              v-for="grant in store.communityMemberAccess[props.member.id]"
              :key="grant.id"
              @click="handleRemoveAccess(grant.id)"
              :disabed="removingAccess"
            >
              <XCircleIcon class="h-6 w-6 mr-2" />
              <p class="w-2/3">
                {{ grant.name }}
              </p>
            </LinkButton>
          </div>
        </div>
        <div
          class="rounded-md border border-solid border-gray-500 p-2 mt-4"
          :class="{
            'opacity-60 bg-gray-300': addingAccess,
          }"
        >
          <p class="text-xs text-slate-700 mb-2">Available</p>
          <div class="grid grid-cols-2 gap-2">
            <!-- Todo - don't show ones the member already has -->
            <LinkButton
              v-for="grant in availableAccess"
              :key="grant.id"
              @click="handleAddAccess(grant)"
              :disabled="addingAccess"
            >
              <PlusCircleIcon class="h-6 w-6 mr-2" />
              <p class="w-2/3">
                {{ grant.name }}
              </p>
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
    <div
      class="absolute inset-x-0 bottom-0 px-6 py-4 flex justify-end space-x-2 border-t border-solid border-gray-200"
    >
      <OutlineButton @click="emit('close')" type="button">Close</OutlineButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType, toRefs, ref, computed } from "vue";
import { MemberWithMembership } from "@/typings/Member";
import { AccessLevel } from "@/typings/AccessLevel";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/vue/outline";
import Heading from "../Heading.vue";
import { possessive } from "@/util/grammar";
import OutlineButton from "../Buttons/OutlineButton.vue";
import { store } from "@/store";
import GhostButton from "../Buttons/GhostButton.vue";
import { ROLES } from "@/util/roles";
import FormLabel from "../Forms/FormLabel.vue";
import { updateMemberRole } from "@/api/communityRole";
import LinkButton from "../Buttons/LinkButton.vue";
import {
  addAccessToMember,
  removeAccessFromMember,
} from "@/api/communityAccess";

const addingAccess = ref(false);
const removingAccess = ref(false);
const updatingRole = ref(false);

const emit = defineEmits(["close"]);

const props = defineProps({
  member: {
    type: Object as PropType<MemberWithMembership>,
    required: true,
  },
});
toRefs(props);

const availableAccess = computed(() => {
  const current = store.communityMemberAccess[props.member.id];
  if (!current) return store.communityAccessLevels;
  return store.communityAccessLevels.filter(
    (level) => !current.some(({ name }) => name === level.name)
  );
});

async function handleRoleUpdate(event: Event) {
  updatingRole.value = true;
  const element = event.target as HTMLSelectElement;
  const membershipMap: Record<string, ROLES> = {
    Admin: ROLES.admin,
    Creator: ROLES.creator,
    Player: ROLES.player,
  };
  await updateMemberRole({
    communityMembershipId: props.member.membershipId,
    role: membershipMap[element.value],
  });
  updatingRole.value = false;
}

async function handleAddAccess(grant: AccessLevel) {
  addingAccess.value = true;
  await addAccessToMember({
    userId: props.member.id,
    accessId: grant.id,
    communityId: grant.community_id,
  });
  if (Array.isArray(store.communityMemberAccess[props.member.id])) {
    store.communityMemberAccess[props.member.id].push({
      id: grant.id,
      name: grant.name,
    });
  } else {
    store.communityMemberAccess[props.member.id] = [
      { id: grant.id, name: grant.name },
    ];
  }
  addingAccess.value = false;
}

async function handleRemoveAccess(communityAccessId: string) {
  removingAccess.value = true;
  await removeAccessFromMember(communityAccessId);
  store.communityMemberAccess[props.member.id] = store.communityMemberAccess[
    props.member.id
  ].filter((access) => access.id !== communityAccessId);
  removingAccess.value = false;
}
</script>
