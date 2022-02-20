<template>
  <div class="flex items-center gap-4 h-10">
    <input
      class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus-styles"
      type="checkbox"
      :checked="members.length === communityStore.members.length"
      @change="toggleAll"
    />
    <p v-if="count" class="text-sm font-semibold">
      {{ count }}
      {{ pluralize({ count, singular: "result" })
      }}<span v-if="members.length > 0">, {{ members.length }} selected</span>
    </p>
    <GhostButton v-if="members.length > 0" class="ml-auto" @click="handleEdit">
      <PencilAltIcon class="h-5 w-5 text-slate-700" />
    </GhostButton>
  </div>
  <div class="grid gap-4">
    <ul>
      <li
        v-for="member in communityStore.members"
        :key="member.id"
        class="flex items-center space-x-2"
      >
        <input
          :id="member.id"
          v-model="members"
          class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus-styles"
          type="checkbox"
          :value="member.id"
        />
        <label
          :for="member.id"
          class="w-full grid gap-1 py-4 pl-2 rounded-md cursor-pointer"
          :class="[expanded ? 'grid-cols-3' : 'grid-cols-2']"
        >
          <div class="grid member-list gap-4">
            <Avatar
              :username="member.username || member.email"
              :avatar-url="member.avatar_url"
            />
            <div class="grid text-left">
              <p class="font-semibold truncate w-full">
                {{ member.username || "Name not set" }}
              </p>
              <p class="text-slate-700 text-sm">{{ member.pronouns }}</p>
            </div>
          </div>
          <p v-if="expanded" class="self-start text-sm text-slate-700">
            {{ member.email }}
          </p>
          <div class="place-self-end">
            <div
              class="rounded-md py-1 px-2 shadow-sm self-start text-center"
              :class="{
                'bg-blue-200': member.role_id === ROLES.admin,
                'bg-gray-200': member.role_id === ROLES.player,
                'bg-teal-200': member.role_id === ROLES.creator,
              }"
            >
              <p class="text-sm capitalize">{{ ROLES[member.role_id] }}</p>
            </div>
            <p class="mt-2 text-slate-500 text-sm max-h-16 text-right">
              {{ store.communityMemberAccess[member.id]?.length || 0 }} access
              {{
                pluralize({
                  count: store.communityMemberAccess[member.id]?.length,
                  singular: "grant",
                })
              }}
            </p>
          </div>
        </label>
      </li>
    </ul>
  </div>
  <Drawer :open="state.context.drawerVisible" @close="send('CANCEL')">
    <MemberForm
      v-if="state.value === 'editMember' && state.context.member"
      :member="state.context.member"
      @close="send('CANCEL')"
      @delete="send('DELETE_MEMBER')"
    />
    <BulkEditMembersForm
      v-if="state.value === 'bulkEdit'"
      :members="state.context.members"
      @close="send('CANCEL')"
    />
  </Drawer>
  <DeleteModal
    :is-deleting="state.value === 'deleting'"
    :open="state.context.modalVisible"
    :title="`Remove ${state.context.member?.username} from community?`"
    message="Are you sure? This will remove their access to the community and cancel any games they created. They will also be removed from any sessions they rsvp'd to."
    @delete="send('DELETE', { member: state.context.member })"
    @cancel="send('CANCEL')"
  />
</template>
<script setup lang="ts">
import { PropType, ref } from "vue";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import { PencilAltIcon } from "@heroicons/vue/outline";
import { MemberWithMembership } from "@/typings/Member";
import Drawer from "@/components/Drawer.vue";
import DeleteModal from "@/components/Modals/DeleteModal.vue";
import { pluralize } from "@/util/grammar";
import MemberForm from "./MemberForm.vue";
import { store } from "@/store";
import Avatar from "@/components/Avatar.vue";
import { supabase } from "@/supabase";
import { Community } from "@/typings/Community";
import useToast from "@/components/Toast/useToast";
import { ROLES } from "@/util/roles";
import { communityStore } from "./communityStore";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import BulkEditMembersForm from "./BulkEditMembersForm.vue";

const { showError } = useToast();

defineProps({
  communityId: {
    type: String as PropType<Community["id"]>,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: undefined,
  },
});

const members = ref<MemberWithMembership["id"][]>([]);

function toggleAll(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target?.checked) {
    members.value = communityStore.members.map(({ id }) => id);
  } else {
    members.value = [];
  }
}

function handleEdit() {
  send({
    type: "EDIT",
    members: members.value.map((id) =>
      communityStore.members.find((member) => member.id === id)
    ),
  });
}

const memberManagementMachine = createMachine<{
  member?: MemberWithMembership;
  members: MemberWithMembership[];
  drawerVisible: boolean;
  modalVisible: boolean;
}>(
  {
    id: "memberManagementMachine",
    context: {
      member: undefined,
      drawerVisible: false,
      modalVisible: false,
      members: [],
    },
    initial: "closed",
    states: {
      closed: {
        on: {
          EDIT: [
            {
              cond: (context, event) => event.members.length === 1,
              target: "editMember",
              actions: ["assignMember", "showDrawer"],
            },
            {
              cond: (context, event) => event.members.length > 1,
              target: "bulkEdit",
              actions: ["assignMembers", "showDrawer"],
            },
          ],
        },
      },
      editMember: {
        on: {
          CANCEL: {
            target: "closed",
            actions: ["clearMember", "hideDrawer"],
          },
          DELETE_MEMBER: {
            target: "deleteMember",
            actions: ["hideDrawer", "showModal"],
          },
        },
      },
      bulkEdit: {
        on: {
          CANCEL: {
            target: "closed",
            actions: ["clearMembers", "hideDrawer"],
          },
          DELETE_MEMBER: {
            target: "deleteMember",
            actions: ["hideDrawer", "showModal"],
          },
        },
      },
      deleteMember: {
        on: {
          DELETE: {
            target: "deleting",
          },
          CANCEL: {
            target: "editMember",
            actions: ["hideModal", "showDrawer"],
          },
        },
      },
      deleting: {
        invoke: {
          src: (context) => {
            if (!context.member) throw Error("no member selected");
            return supabase
              .from("community_memberships")
              .delete()
              .eq("id", context.member);
          },
          onDone: {
            target: "closed",
            actions: ["hideModal", "hideDrawer", "removeMember"],
          },
          onError: {
            target: "editMember",
            actions: ["hideModal", "showDrawer", "showError"],
          },
        },
      },
    },
  },
  {
    actions: {
      addToList: assign({
        members: (context, event) => context.members.concat(event.member),
      }),
      removeFromList: assign({
        members: (context, event) =>
          context.members.filter((member) => member.id !== event.member.id),
      }),
      assignMember: assign({
        member: (context, event) => event.members[0],
      }),
      assignMembers: assign({
        members: (context, event) => event.members,
      }),
      clearMember: assign({
        member: (_, __) => undefined,
      }),
      clearMembers: assign({
        members: (_, __) => [],
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
      removeMember: assign({
        member: (context) => {
          if (!context.member) throw Error("no member");
          communityStore.members = communityStore.members.filter(
            (member) => member.id !== context.member?.id
          );
          return undefined;
        },
      }),
      showError: () => {
        showError({ message: "Something went wrong " });
      },
    },
  }
);

const { state, send } = useMachine(memberManagementMachine);
</script>
<style scoped>
.member-list {
  grid-template-columns: auto 1fr;
}
</style>
