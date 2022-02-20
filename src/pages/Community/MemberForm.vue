<template>
  <div class="h-full flex flex-col relative">
    <div class="grow flex flex-col gap-8 overflow-auto">
      <section class="px-6 pt-6">
        <Heading level="h6" as="h2" class="mb-6">
          Edit {{ possessive(member?.username || member?.email || "") }} role
          and access
        </Heading>
        <div class="flex flex-col relative">
          <FormLabel for="role">Role</FormLabel>
          <select
            id="role"
            v-model="currentRole"
            class="mt-1 rounded-md border border-solid border-gray-300 text-slate-900 dark:bg-slate-200 focus-styles"
            :disabled="updatingRole"
            @change="handleRoleUpdate($event)"
          >
            <option :value="ROLES.admin">Admin</option>
            <option :value="ROLES.creator">Creator</option>
            <option :value="ROLES.player">Player</option>
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
            <PrimaryButton
              v-for="grant in store.communityMemberAccess[props.member.id]"
              :key="grant.id"
              :disabed="removingAccess"
              @click="handleRemoveAccess(grant.id)"
            >
              <XCircleIcon class="h-6 w-6 mr-2" />
              {{ grant.name }}
            </PrimaryButton>
          </div>
        </div>
        <div
          class="rounded-md border border-solid border-gray-500 p-2 mt-4"
          :class="{
            'opacity-60 bg-gray-300': addingAccess,
          }"
        >
          <p class="text-xs text-slate-700 mb-2">Available</p>
          <div class="grid grid-cols-2 gap-2 py-2">
            <PrimaryButton
              v-for="grant in availableAccess"
              :key="grant.id"
              :disabled="addingAccess"
              @click="handleAddAccess(grant)"
            >
              <PlusCircleIcon class="h-6 w-6 mr-2" />
              {{ grant.name }}
            </PrimaryButton>
          </div>
        </div>
      </section>
    </div>
    <DrawerFooter>
      <GhostButton
        type="button"
        class="mr-auto"
        aria-label="Remve member from community"
        @click="emit('delete')"
      >
        <TrashIcon class="h-5 w-5 text-red-600" />
      </GhostButton>
      <OutlineButton type="button" @click="emit('close')">Close</OutlineButton>
    </DrawerFooter>
  </div>
</template>
<script setup lang="ts">
import { PropType, ref, computed } from "vue";
import { MemberWithMembership } from "@/typings/Member";
import { AccessLevel } from "@/typings/AccessLevel";
import { PlusCircleIcon, XCircleIcon, TrashIcon } from "@heroicons/vue/outline";
import Heading from "@/components/Heading.vue";
import { possessive } from "@/util/grammar";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import { store } from "@/store";
import { ROLES } from "@/util/roles";
import FormLabel from "@/components/Forms/FormLabel.vue";
import { updateMemberRole } from "@/api/communityRole";
import {
  addAccessToMember,
  removeAccessFromMember,
} from "@/api/communityAccess";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import useToast from "@/components/Toast/useToast";
import { communityStore } from "./communityStore";
import DrawerFooter from "@/components/DrawerFooter.vue";

const { showSuccess } = useToast();

const emit = defineEmits(["close", "delete"]);

const props = defineProps({
  member: {
    type: Object as PropType<MemberWithMembership>,
    required: true,
  },
});

const member = computed(() =>
  communityStore.members.find((member) => member.id === props.member.id)
);

if (!member.value) {
  throw new Error("member not found in store");
}

const addingAccess = ref(false);
const removingAccess = ref(false);
const updatingRole = ref(false);
const currentRole = ref(member.value.role_id);

const availableAccess = computed(() => {
  const current = store.communityMemberAccess[props.member.id];
  if (!current) return store.communityAccessLevels;
  return store.communityAccessLevels.filter(
    (level) => !current.some(({ name }) => name === level.name)
  );
});

async function handleRoleUpdate(event: Event) {
  if (!member.value) {
    throw new Error("No member loaded");
  }
  updatingRole.value = true;
  const element = event.target as HTMLSelectElement;
  const newRoleId = Number(element.value) as ROLES;
  await updateMemberRole({
    communityMembershipId: member.value.membershipId,
    roleId: newRoleId,
  });
  updatingRole.value = false;
  showSuccess({ message: "Role updated" });
  communityStore.members = communityStore.members.map((member) => {
    if (member.id === props.member.id) {
      return { ...member, role_id: newRoleId };
    }
    return member;
  });
}

async function handleAddAccess(grant: AccessLevel) {
  addingAccess.value = true;
  const data = await addAccessToMember({
    userId: props.member.id,
    accessId: grant.id,
    communityId: grant.community_id,
  });
  if (data) {
    if (Array.isArray(store.communityMemberAccess[props.member.id])) {
      store.communityMemberAccess[props.member.id].push({
        id: data.id,
        name: grant.name,
      });
    } else {
      store.communityMemberAccess[props.member.id] = [
        { id: data.id, name: grant.name },
      ];
    }
    showSuccess({ message: "Access updated" });
  }
  addingAccess.value = false;
}

async function handleRemoveAccess(communityAccessId: number) {
  removingAccess.value = true;
  const data = await removeAccessFromMember(communityAccessId);
  if (data) {
    store.communityMemberAccess[props.member.id] = store.communityMemberAccess[
      props.member.id
    ].filter((access) => access.id !== communityAccessId);
    showSuccess({ message: "Access updated" });
  }
  removingAccess.value = false;
}
</script>
