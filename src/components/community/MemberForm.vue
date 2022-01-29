<template>
  <form class="h-full grid member-form-grid">
    <section class="p-6">
      <Heading level="h6" as="h2" class="mb-6">
        Edit {{ possessive(member.username) }} role and access
      </Heading>
      <div class="flex flex-col">
        <FormLabel for="role">Role</FormLabel>
        <select
          :value="member.role"
          class="rounded-md border border-solid border-gray-300 text-slate-900 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
          @change="handleRoleUpdate($event)"
          id="role"
        >
          <option value="Admin">Admin</option>
          <option value="Creator">Creator</option>
          <option value="Player">Player</option>
        </select>
      </div>
    </section>
    <hr class="my-12" />
    <section class="p-6">
      <Heading level="h6" as="h3">Access grants</Heading>
      <p class="text-sm text-slate-700 mt-4 mb-2">Current</p>
      <div class="flex space-x-4">
        <GhostButton v-for="grant in member.access" :key="grant.id">
          {{ grant.name }}
          <XCircleIcon class="h-6 w-6 ml-2" />
        </GhostButton>
      </div>
      <p class="text-sm text-slate-700 mt-4 mb-2">Available</p>
      <div class="grid auto-cols-auto grid-flow-col gap-4">
        <!-- Todo - don't show ones the member already has -->
        <GhostButton
          v-for="grant in store.community.communityAccessLevels"
          :key="grant.id"
        >
          <PlusCircleIcon class="h-6 w-6 mr-2" />
          {{ grant.name }}
        </GhostButton>
      </div>
    </section>
    <div
      class="px-6 py-4 flex justify-end space-x-2 border-t border-solid border-gray-200 place-self-end"
    >
      <OutlineButton @click="emit('close')" type="button">Cancel</OutlineButton>
    </div>
  </form>
</template>
<script setup lang="ts">
import { PropType, toRefs } from "vue";
import { MemberWithMembership } from "@/typings/Member";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/vue/outline";
import Heading from "../Heading.vue";
import { possessive } from "@/util/grammar";
import OutlineButton from "../Buttons/OutlineButton.vue";
import { store } from "@/store";
import GhostButton from "../Buttons/GhostButton.vue";
import { ROLES } from "@/util/roles";
import FormLabel from "../Forms/FormLabel.vue";
import { updateMemberRole } from "@/api/communityRole";

const emit = defineEmits(["close"]);

const props = defineProps({
  member: {
    type: Object as PropType<MemberWithMembership>,
    required: true,
  },
});
toRefs(props);

async function handleRoleUpdate(event: Event) {
  const element = event.target as HTMLSelectElement;
  const membershipMap: Record<string, ROLES> = {
    Admin: ROLES.admin,
    Creator: ROLES.creator,
    Player: ROLES.player,
  };
  updateMemberRole({
    communityMembershipId: props.member.membershipId,
    role: membershipMap[element.value],
  });
}
</script>
<style scoped>
.member-form-grid {
  grid-template-rows: auto auto auto auto;
}
</style>
