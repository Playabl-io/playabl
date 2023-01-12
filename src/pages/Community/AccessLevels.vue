<template>
  <div class="flex justify-between mb-4">
    <Heading level="h6" as="h2">Access Levels</Heading>
    <GhostButton
      class="font-normal text-sm"
      aria-label="Add new access level"
      @click="send('NEW_ACCESS_LEVEL')"
    >
      <PlusCircleIcon class="h-6 w-6 text-slate-700" />
    </GhostButton>
  </div>
  <ul>
    <li
      v-for="level in store.communityAccessLevels"
      :key="level.id"
      class="grid gap-y-4"
    >
      <ListItemButton
        class="flex justify-between items-center"
        @click="send({ type: 'EDIT_ACCESS_LEVEL', accessLevel: level })"
      >
        <div class="flex flex-col items-start">
          <p class="block truncate font-semibold">
            {{ level.name }}
          </p>
          <p class="text-sm text-slate-700 mt-1">
            {{ level.priority_access_time }} {{ level.time_denomination }}
          </p>
        </div>
        <div class="flex space-x-2">
          <Tooltip v-if="level.is_mandatory">
            <template #trigger="{ toggleTooltip }">
              <LockClosedIcon
                class="h-5 w-5 text-slate-700 justify-self-center"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
            <template #tooltip>Mandatory rule</template>
          </Tooltip>
          <Tooltip v-if="level.apply_on_join">
            <template #trigger="{ toggleTooltip }">
              <BoltIcon
                class="h-5 w-5 text-slate-700 justify-self-center"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
            <template #tooltip>
              <p class="w-32">All members receive this access when joining</p>
            </template>
          </Tooltip>
        </div>
      </ListItemButton>
    </li>
  </ul>
  <SideDrawer :open="state.context.drawerVisible" @close="send('CANCEL')">
    <AccessLevelForm
      :access-level="state.context.accessLevel"
      :community-id="communityId"
      :saving="['updating', 'creating'].includes(state.value as string)"
      @close="send('CANCEL')"
      @save="send('SAVE', $event)"
      @delete="send('DELETE_ACCESS_LEVEL')"
    />
  </SideDrawer>
  <DeleteModal
    :is-deleting="state.value === 'deleting'"
    :open="state.context.modalVisible"
    :title="`Delete access policy ${state.context.accessLevel?.name}?`"
    message="Are you sure? This action is permanent."
    @delete="send('DELETE', { accessLevel: state.context.accessLevel })"
    @cancel="send('CANCEL')"
  />
</template>
<script setup lang="ts">
import { store } from "@/store";
import { useRoute } from "vue-router";
import {
  LockClosedIcon,
  BoltIcon,
  PlusCircleIcon,
} from "@heroicons/vue/24/outline";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import SideDrawer from "@/components/SideDrawer.vue";
import AccessLevelForm from "./AccessForm.vue";
import DeleteModal from "@/components/Modals/DeleteModal.vue";
import {
  createAccessLevel,
  deleteAccessLevel,
  updateAccessLevel,
} from "@/api/accessLevels";
import useToast from "@/components/Toast/useToast";
import { AccessLevel } from "@/typings/AccessLevel";
import Heading from "@/components/Heading.vue";
import Tooltip from "@/components/Tooltip.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import ListItemButton from "@/components/Buttons/ListItemButton.vue";
import { drawerActions } from "@/util/machineActions";
import { communityStore } from "./communityStore";

const route = useRoute();
const { showSuccess, showError } = useToast();

const communityId = communityStore.community.id;

const accessLevelsMachine = createMachine(
  {
    schema: {
      context: {} as {
        accessLevel?: AccessLevel;
        drawerVisible: boolean;
        modalVisible: boolean;
      },
      events: {} as
        | { type: "EDIT_ACCESS_LEVEL"; accessLevel: AccessLevel }
        | { type: "NEW_ACCESS_LEVEL" }
        | { type: "CANCEL" }
        | { type: "DELETE"; accessLevel: AccessLevel }
        | { type: "SAVE"; accessLevel: AccessLevel }
        | { type: "DELETE_ACCESS_LEVEL" },
    },
    id: "accessLevelsMachine",
    predictableActionArguments: true,
    context: {
      accessLevel: undefined,
      drawerVisible: false,
      modalVisible: false,
    },
    initial: "closed",
    states: {
      closed: {
        on: {
          EDIT_ACCESS_LEVEL: {
            target: "editAccessLevel",
            actions: ["assignAccessLevel", "showDrawer"],
          },
          NEW_ACCESS_LEVEL: {
            target: "newAccessLevel",
            actions: "showDrawer",
          },
        },
      },
      editAccessLevel: {
        on: {
          CANCEL: {
            target: "closed",
            actions: ["clearAccessLevel", "hideDrawer"],
          },
          SAVE: {
            target: "updating",
          },
          DELETE_ACCESS_LEVEL: {
            target: "deleteAccessLevel",
            actions: ["hideDrawer", "showModal"],
          },
        },
      },
      updating: {
        invoke: {
          src: async (context, event) => {
            if (event.type === "SAVE") {
              return updateAccessLevel(event.accessLevel);
            }
          },
          onDone: {
            target: "closed",
            actions: ["updateAccessLevel", "clearAccessLevel", "hideDrawer"],
          },
          onError: {
            target: "editAccessLevel",
            actions: ["showError"],
          },
        },
      },
      newAccessLevel: {
        on: {
          CANCEL: {
            target: "closed",
            actions: "hideDrawer",
          },
          SAVE: {
            target: "creating",
          },
        },
      },
      creating: {
        invoke: {
          src: async (context, event) => {
            if (event.type === "SAVE") {
              return createAccessLevel({
                ...event.accessLevel,
                community_id: communityId,
              });
            }
          },
          onDone: {
            target: "closed",
            actions: ["addAccessLevel", "hideDrawer"],
          },
          onError: {
            target: "newAccessLevel",
            actions: ["showError"],
          },
        },
      },
      deleteAccessLevel: {
        on: {
          CANCEL: {
            target: "editAccessLevel",
            actions: ["hideModal", "showDrawer"],
          },
          DELETE: {
            target: "deleting",
          },
        },
      },
      deleting: {
        invoke: {
          src: async (context, event) => {
            if (event.type === "DELETE") {
              return deleteAccessLevel({
                ...event.accessLevel,
                community_id: communityId,
              });
            }
          },
          onDone: {
            target: "closed",
            actions: [
              "removeAccessLevel",
              "clearAccessLevel",
              "hideDrawer",
              "hideModal",
            ],
          },
          onError: {
            target: "deleteAccessLevel",
            actions: ["showError"],
          },
        },
      },
    },
  },
  {
    actions: {
      ...drawerActions,
      showModal: assign({
        modalVisible: (context) => true,
      }),
      hideModal: assign({
        modalVisible: (context) => false,
      }),
      assignAccessLevel: assign({
        accessLevel: (context, event) => {
          if (event.type === "EDIT_ACCESS_LEVEL") {
            return event.accessLevel;
          }
        },
      }),
      clearAccessLevel: assign({
        accessLevel: (_, __) => undefined,
      }),
      updateAccessLevel: (context, event: Record<string, unknown>) => {
        const data = event.data as AccessLevel;
        store.communityAccessLevels = store.communityAccessLevels.map(
          (level) => {
            if (level.id === data.id) {
              return data;
            }
            return level;
          }
        );
        showSuccess({ message: "Access rule updated" });
      },
      addAccessLevel: (context, event: Record<string, unknown>) => {
        const data = event.data as AccessLevel;
        store.communityAccessLevels.push(data);
        showSuccess({ message: "Access rule added" });
      },
      removeAccessLevel: (context, event: Record<string, unknown>) => {
        const data = event.data as AccessLevel;
        store.communityAccessLevels = store.communityAccessLevels.filter(
          (level) => level.id !== data.id
        );
        showSuccess({ message: "Access rule deleted" });
      },
      showError: (context, event: Record<string, unknown>) => {
        // @ts-expect-error cannot type xstate event to provide enough info
        showError({ message: event.data?.message || "Something went wrong" });
      },
    },
  }
);

const { state, send } = useMachine(accessLevelsMachine);
</script>
<style scoped>
.access-rules-grid {
  grid-template-columns: 2fr 1fr 1fr 5rem;
}
</style>
