<template>
  <div class="flex items-end flex-wrap mt-2 mb-4 gap-6">
    <div class="relative flex items-center grow">
      <MagnifyingGlassIcon class="h-5 w-5 absolute left-2" />
      <FormInput
        id="membersSearchTerm"
        v-model="membersSearchTerm"
        class="pl-8 grow"
        placeholder="Search by name or email"
      />
    </div>
    <div v-if="expanded" class="flex flex-col">
      <FormSelect v-model.number="roleFilter" aria-label="Filter by role">
        <option>Filter by role</option>
        <option :value="ROLES.admin">Admin</option>
        <option :value="ROLES.creator">Creator</option>
        <option :value="ROLES.player">Players</option>
      </FormSelect>
    </div>
  </div>
  <div class="relative">
    <LoadingSpinner
      v-if="state.value === 'searching'"
      color="brand-500"
      class="absolute h-full w-full flex items-center justify-center"
    />
    <div
      class="transition-all duration-100"
      :class="{
        'blur-sm': state.value === 'searching',
      }"
    >
      <MembersList
        :community-id="communityStore.community.id"
        :expanded="expanded"
        :count="state.context.count"
      />
      <div class="flex justify-center mt-4">
        <Paginator
          v-if="state.context.count"
          :count="state.context.count"
          :page-size="DEFAULT_PAGE_SIZE"
          :current-page="state.context.page"
          @page-select="send({ type: 'PAGE_SELECT', page: $event })"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { debouncedWatch } from "@vueuse/core";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import FormInput from "@/components/Forms/FormInput.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";
import { ROLES } from "@/util/roles";
import { searchCommunityMembers } from "@/api/communityMemberships";
import MembersList from "./MembersList.vue";
import { communityStore } from "./communityStore";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Paginator from "@/components/Paginator.vue";
import { DEFAULT_PAGE_SIZE } from "@/util/pagination";

defineProps({
  expanded: {
    type: Boolean,
    required: true,
  },
});

const searchMachine = createMachine<
  {
    searchTerm: string;
    roleId?: number;
    pageSize: number;
    page: number;
    from: number;
    to: number;
    hasPriorPage: boolean;
    hasNextPage: boolean;
    results: unknown[];
    count?: number;
  },
  | { type: "SEARCH"; searchTerm: string; roleId?: number }
  | { type: "PAGE_NEXT" }
  | { type: "PAGE_PREVIOUS" }
  | { type: "PAGE_SELECT"; page: number }
>(
  {
    id: "searchMachine",
    context: {
      searchTerm: "",
      roleId: undefined,
      pageSize: DEFAULT_PAGE_SIZE,
      page: 0,
      from: 0,
      to: 0,
      hasPriorPage: false,
      hasNextPage: false,
      results: [],
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          SEARCH: {
            target: "searching",
            actions: ["resetPaging", "assignSearchTerm", "assignRoleFilter"],
          },
          PAGE_NEXT: {
            target: "searching",
            actions: ["incrementPage"],
          },
          PAGE_PREVIOUS: {
            target: "searching",
            actions: ["decrementPage"],
          },
          PAGE_SELECT: {
            target: "searching",
            actions: ["setPage"],
          },
        },
      },
      searching: {
        on: {
          SEARCH: {
            target: "searching",
            actions: ["resetPaging", "assignSearchTerm"],
          },
        },
        invoke: {
          src: (context) =>
            searchCommunityMembers({
              communityId: communityStore.community.id,
              searchTerm: context.searchTerm,
              roleId: context.roleId,
              from: context.from,
              to: context.to,
            }),
          onDone: {
            target: "idle",
            actions: ["assignResults", "assignToCommunityStore"],
          },
        },
      },
    },
  },
  {
    actions: {
      assignSearchTerm: assign({
        searchTerm: (context, event) => event.searchTerm,
      }),
      assignRoleFilter: assign({
        roleId: (context, event) => event.roleId,
      }),
      resetPaging: assign({
        from: (context, event) => 0,
        to: (context, event) => context.pageSize - 1,
        page: 0,
      }),
      assignResults: assign({
        results: (context, event) => event.data.data,
        hasNextPage: (context, event) => event.data.count > context.to + 1,
        hasPriorPage: (context, event) => context.from > 0,
        count: (context, event) => event.data.count,
      }),
      assignToCommunityStore: (context, event) => {
        communityStore.membersCount = event.data.count;
        communityStore.members = event.data.data?.map((member) => {
          const communityMembership = member.community_memberships[0];
          return {
            ...member,
            role_id: communityMembership.role_id,
            membershipId: communityMembership.id,
          };
        });
      },
      incrementPage: assign({
        from: (context) => context.from + context.pageSize,
        to: (context) => context.to + context.pageSize,
        page: (context) => context.page + 1,
      }),
      decrementPage: assign({
        from: (context) => context.from - context.pageSize,
        to: (context) => context.to - context.pageSize,
        page: (context) => context.page - 1,
      }),
      setPage: assign({
        from: (context, event) => event.page * context.pageSize,
        to: (context, event) =>
          event.page * context.pageSize + (context.pageSize - 1),
        page: (context, event) => event.page,
      }),
    },
  }
);

const { state, send } = useMachine(searchMachine);

const membersSearchTerm = ref("");
const roleFilter = ref<ROLES>();

onMounted(() => {
  send({ type: "SEARCH", searchTerm: "" });
});

debouncedWatch(
  () => membersSearchTerm.value,
  (updated) =>
    send({ type: "SEARCH", searchTerm: updated, roleId: roleFilter.value }),
  { debounce: 750 }
);
watch(
  () => roleFilter.value,
  (updated) =>
    send({
      type: "SEARCH",
      searchTerm: membersSearchTerm.value,
      roleId: updated,
    })
);
</script>
