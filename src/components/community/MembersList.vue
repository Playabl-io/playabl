<template>
  <div class="grid gap-4">
    <ul>
      <li v-for="member in store.communityMembers" :key="member.id">
        <button
          class="w-full grid gap-1 p-4 rounded-md transition-all transform duration-150 hover:shadow-lg hover:-translate-y-1"
          @click="
            send({
              type: 'EDIT_MEMBER',
              member,
            })
          "
        >
          <div class="grid member-list gap-4">
            <div
              class="rounded-full w-10 h-10 bg-brand-200 text-brand-500 grid place-items-center content-center"
            >
              {{ member.username.charAt(0) }}
            </div>
            <div class="grid place-items-start text-left">
              <p class="font-semibold truncate w-full">
                {{ member.username }}
              </p>
              <p class="text-slate-700 text-sm">{{ member.pronouns }}</p>
            </div>
            <div
              class="rounded-md py-1 px-2 shadow-sm self-start"
              :class="{
                'bg-blue-200': member.role === 'Admin',
                'bg-gray-200': member.role === 'Player',
                'bg-teal-200': member.role === 'Creator',
              }"
            >
              <p class="text-sm">{{ member.role }}</p>
            </div>
          </div>
          <p class="text-slate-500 text-sm max-h-16 text-right">
            {{ store.communityMemberAccess[member.id]?.length || 0 }} access
            {{
              pluralize({
                count: store.communityMemberAccess[member.id]?.length,
                singular: "grant",
              })
            }}
          </p>
        </button>
      </li>
    </ul>
  </div>
  <Drawer :open="state.context.drawerVisible" @close="send('CANCEL')">
    <MemberForm
      v-if="state.context.member"
      :member="state.context.member"
      @close="send('CANCEL')"
    />
  </Drawer>
  <DeleteModal
    :is-deleting="state.value === 'deleting'"
    :open="state.context.modalVisible"
    :title="`Remove ${state.context.member?.username} from community?`"
    message="Are you sure? This action is permanent."
    @delete="send('DELETE', { member: state.context.member })"
    @cancel="send('CANCEL')"
  />
</template>
<script setup lang="ts">
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import { MemberWithMembership } from "@/typings/Member";
import Drawer from "../Drawer.vue";
import DeleteModal from "../DeleteModal.vue";
import { pluralize } from "@/util/grammar";
import MemberForm from "./MemberForm.vue";
import { store } from "@/store";

const memberManagementMachine = createMachine<{
  member?: MemberWithMembership;
  drawerVisible: boolean;
  modalVisible: boolean;
}>(
  {
    id: "memberManagementMachine",
    context: {
      member: undefined,
      drawerVisible: false,
      modalVisible: false,
    },
    initial: "closed",
    states: {
      closed: {
        on: {
          EDIT_MEMBER: {
            target: "editMember",
            actions: ["assignMember", "showDrawer"],
          },
          NEW_INVITE_LINK: {
            target: "newInviteLink",
            actions: "showDrawer",
          },
          DELETE_MEMBER: {
            target: "deleteMember",
            actions: ["assignMember", "showModal"],
          },
        },
      },
      editMember: {
        on: {
          CANCEL: {
            target: "closed",
            actions: ["clearMember", "hideDrawer"],
          },
        },
      },
      newInviteLink: {},
      deleteMember: {},
    },
  },
  {
    actions: {
      assignMember: assign({
        member: (context, event) => event.member,
      }),
      clearMember: assign({
        member: (_, __) => undefined,
      }),
      showDrawer: assign({
        drawerVisible: (context, event) => true,
      }),
      hideDrawer: assign({
        drawerVisible: (context, event) => false,
      }),
      showModal: assign({
        modalVisible: (context, event) => true,
      }),
      hideModal: assign({
        modalVisible: (context, event) => false,
      }),
    },
  }
);

const { state, send } = useMachine(memberManagementMachine);
</script>
<style scoped>
.member-list {
  grid-template-columns: auto 1fr auto;
}
</style>
