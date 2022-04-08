<template>
  <form class="h-full flex flex-col relative" @submit.prevent="handleSubmit">
    <fieldset
      class="grow flex flex-col gap-8 overflow-auto"
      :disabled="processing"
    >
      <section class="px-6 pt-6">
        <Heading level="h6" as="h2" class="mb-6">
          Bulk edit member role and access
        </Heading>
        <div class="flex flex-col relative">
          <FormLabel for="role">Role</FormLabel>
          <FormSelect id="role" v-model.number="roleToAssign" class="mt-1">
            <option value="">Select a role</option>
            <option :value="ROLES.admin">Admin</option>
            <option :value="ROLES.creator">Creator</option>
            <option :value="ROLES.player">Player</option>
          </FormSelect>
        </div>
      </section>
      <hr />
      <section class="px-6">
        <Heading level="h6" as="h3">Access</Heading>
        <p class="text-sm text-slate-700 mt-2 mb-4">
          Select which, if any, access levels to add or remove from the selected
          members
        </p>
        <div class="grid grid-cols-2 gap-4 py-2">
          <span />
          <span class="grid grid-cols-2 gap-4 place-items-center">
            <p class="font-semibold text-sm text-slate-700">Add</p>
            <p class="font-semibold text-sm text-slate-700">Remove</p>
          </span>
        </div>
        <div
          v-for="grant in store.communityAccessLevels"
          :key="grant.id"
          class="grid grid-cols-2 gap-4 py-2"
        >
          <p>
            {{ grant.name }}
          </p>
          <div class="grid grid-cols-2 gap-4 place-items-center">
            <input
              v-model="grantsToAdd"
              :name="grant.name"
              class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus-styles"
              type="checkbox"
              :value="grant"
              @change="handleToAdd(grant.id)"
            />
            <input
              v-model="grantsToRemove"
              :name="grant.name"
              class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus-styles"
              type="checkbox"
              :value="grant"
              @change="handleToRemove(grant.id)"
            />
          </div>
        </div>
      </section>
    </fieldset>
    <DrawerFooter>
      <OutlineButton type="button" :disabled="processing" @click="emit('close')"
        >Close</OutlineButton
      >
      <PrimaryButton :is-loading="processing">Update</PrimaryButton>
    </DrawerFooter>
  </form>
</template>
<script setup lang="ts">
import { PropType, ref } from "vue";
import { MemberWithMembership } from "@/typings/Member";
import { AccessLevel } from "@/typings/AccessLevel";
import Heading from "@/components/Heading.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import { store } from "@/store";
import { ROLES } from "@/util/roles";
import FormLabel from "@/components/Forms/FormLabel.vue";
import { updateMemberRole } from "@/api/communityRole";
import {
  addAccessToMember,
  loadUserCommunityAccess,
  removeAccessFromMember,
} from "@/api/communityAccess";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import useToast from "@/components/Toast/useToast";
import { communityStore } from "./communityStore";
import DrawerFooter from "@/components/DrawerFooter.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";

const { showSuccess, showError } = useToast();

const emit = defineEmits(["close"]);

const props = defineProps({
  members: {
    type: Array as PropType<MemberWithMembership[]>,
    required: true,
  },
});

const roleToAssign = ref<ROLES>();
const processing = ref(false);
const grantsToAdd = ref<AccessLevel[]>([]);
const grantsToRemove = ref<AccessLevel[]>([]);

function handleToAdd(id: number) {
  grantsToRemove.value = grantsToRemove.value.filter((val) => val.id !== id);
}
function handleToRemove(id: number) {
  grantsToAdd.value = grantsToAdd.value.filter((val) => val.id !== id);
}

async function handleSubmit() {
  processing.value = true;
  try {
    const promises = [];
    if (roleToAssign.value) {
      promises.push(
        props.members.map((member) =>
          handleRoleUpdate({ member: member, roleId: roleToAssign.value })
        )
      );
    }
    if (grantsToAdd.value.length > 0) {
      grantsToAdd.value.forEach((grant) => {
        promises.push(
          props.members.map((member) =>
            handleAddAccess({ memberId: member.id, grant })
          )
        );
      });
    }
    if (grantsToRemove.value.length > 0) {
      grantsToRemove.value.forEach((grant) => {
        promises.push(
          props.members.map((member) =>
            handleRemoveAccess({ memberId: member.id, grant })
          )
        );
      });
    }
    await Promise.all(promises.flat(1));
    showSuccess({ message: "All operations completed" });
    emit("close");
  } catch (error) {
    showError({ message: "Unable to complete operations" });
  } finally {
    processing.value = false;
  }
}

async function handleRoleUpdate({
  member,
  roleId,
}: {
  member: MemberWithMembership;
  roleId: number;
}) {
  await updateMemberRole({
    communityMembershipId: member.membershipId,
    roleId,
  });
  communityStore.members = communityStore.members.map((storeMember) => {
    if (storeMember.id === member.id) {
      return { ...storeMember, role_id: roleId };
    }
    return storeMember;
  });
}

async function handleAddAccess({
  memberId,
  grant,
}: {
  memberId: MemberWithMembership["id"];
  grant: AccessLevel;
}) {
  const userAccess = await loadUserCommunityAccess({
    userId: memberId,
    communityId: communityStore.community.id,
  });
  if (userAccess?.find((access) => access.access_level_id === grant.id)) return;
  await addAccessToMember({
    userId: memberId,
    accessId: grant.id,
    communityId: grant.community_id,
  });
  if (Array.isArray(store.communityMemberAccess[memberId])) {
    store.communityMemberAccess[memberId].push({
      id: grant.id,
      name: grant.name,
    });
  } else {
    store.communityMemberAccess[memberId] = [
      { id: grant.id, name: grant.name },
    ];
  }
}

async function handleRemoveAccess({
  memberId,
  grant,
}: {
  memberId: MemberWithMembership["id"];
  grant: AccessLevel;
}) {
  const userAccess = await loadUserCommunityAccess({
    userId: memberId,
    communityId: communityStore.community.id,
  });
  const userAccessToDelete = userAccess?.find(
    (access) => access.access_level_id === grant.id
  );
  if (!userAccessToDelete) return;
  await removeAccessFromMember(userAccessToDelete.id);
  store.communityMemberAccess[memberId] = store.communityMemberAccess[
    memberId
  ].filter((access) => access.name !== grant.name);
}
</script>
