<template>
  <div class="flex items-center gap-4 h-10">
    <input
      class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus-styles"
      type="checkbox"
      :checked="selectedMembers.length === communityStore.members.length"
      @change="toggleAll"
    />
    <p class="text-sm font-semibold">
      {{ count }}
      {{ pluralize({ count, singular: "result" })
      }}<span v-if="selectedMembers.length > 0"
        >, {{ selectedMembers.length }} selected</span
      >
    </p>
    <GhostButton
      v-if="selectedMembers.length > 0"
      class="ml-auto"
      @click="handleEdit"
    >
      <PencilSquareIcon class="h-5 w-5 text-slate-700" />
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
          v-model="selectedMembers"
          class="text-brand-500 rounded-md shadow-sm border border-gray-300 dark:bg-slate-200 focus-styles"
          type="checkbox"
          :value="member.id"
        />
        <label
          :for="member.id"
          class="w-full grid grid-cols-2 md:grid-cols-3 gap-1 py-4 pl-2 rounded-md cursor-pointer"
        >
          <div class="grid member-list gap-4">
            <UserAvatar
              v-if="isMdAndLarger"
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
          <p v-if="isMdAndLarger" class="self-start text-sm text-slate-700">
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
  <SideDrawer :open="state.context.drawerVisible" @close="send('CANCEL')">
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
  </SideDrawer>
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
import { onMounted, PropType, ref } from "vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import { PencilSquareIcon } from "@heroicons/vue/24/outline";
import { MemberWithMembership } from "@/typings/Member";
import SideDrawer from "@/components/SideDrawer.vue";
import DeleteModal from "@/components/Modals/DeleteModal.vue";
import { pluralize } from "@/util/grammar";
import MemberForm from "./MemberForm.vue";
import { store } from "@/store";
import UserAvatar from "@/components/UserAvatar.vue";
import { supabase } from "@/supabase";
import { Community } from "@/typings/Community";
import useToast from "@/components/Toast/useToast";
import { ROLES } from "@/util/roles";
import { communityStore } from "./communityStore";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import BulkEditMembersForm from "./BulkEditMembersForm.vue";
import { drawerActions } from "@/util/machineActions";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMdAndLarger = breakpoints.greater("md");

const { showError } = useToast();

const props = defineProps({
  communityId: {
    type: String as PropType<Community["id"]>,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  searchObservable: {
    required: true,
    type: Object as PropType<{
      subscribe(fn: () => void): void;
      notify(): void;
    }>,
  },
});

onMounted(() => {
  props.searchObservable.subscribe(clearSelected);
});

const selectedMembers = ref<MemberWithMembership["id"][]>([]);

function clearSelected() {
  selectedMembers.value = [];
}

function toggleAll(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target?.checked) {
    selectedMembers.value = communityStore.members.map(({ id }) => id);
  } else {
    selectedMembers.value = [];
  }
}

function handleEdit() {
  send({
    type: "EDIT",
    members: selectedMembers.value.map((id) =>
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
    predictableActionArguments: true,
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
          src: async (context) => {
            if (!context.member) throw Error("no member selected");
            const { error } = await supabase
              .from("community_memberships")
              .delete()
              .eq("id", context.member.membershipId);
            if (error) {
              throw error;
            }
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
      ...drawerActions,
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
        member: (_) => undefined,
      }),
      clearMembers: assign({
        members: (_) => [],
      }),
      showModal: assign({
        modalVisible: (_) => true,
      }),
      hideModal: assign({
        modalVisible: (_) => false,
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
