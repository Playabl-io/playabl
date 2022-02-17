<template>
  <div class="flex justify-between mb-4">
    <Heading level="h6" as="h2">Access Levels</Heading>
    <LinkButton class="font-normal text-sm" @click="send('NEW_ACCESS_LEVEL')">
      Add new
    </LinkButton>
  </div>
  <ul>
    <li
      v-for="level in store.communityAccessLevels"
      :key="level.id"
      class="grid gap-y-4"
    >
      <button
        class="flex justify-between items-center p-4 rounded-md transition-all transform duration-150 hover:shadow-lg hover:-translate-y-1"
        @click="
          send({ type: 'EDIT_ACCESS_LEVEL', payload: { accessLevel: level } })
        "
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
              <CheckCircleIcon
                class="h-6 w-6 text-slate-700 justify-self-center"
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
              <CogIcon
                class="h-6 w-6 text-slate-700 justify-self-center"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
            <template #tooltip>
              All members receive this access when joining
            </template>
          </Tooltip>
        </div>
      </button>
    </li>
  </ul>
  <Drawer :open="state.context.drawerVisible" @close="send('CANCEL')">
    <AccessLevelForm
      :access-level="state.context.accessLevel"
      :community-id="(route.params.community_id as string)"
      :saving="['updating', 'creating'].includes(state.value as string)"
      @close="send('CANCEL')"
      @save="send('SAVE', $event)"
      @delete="send('DELETE_ACCESS_LEVEL')"
    />
  </Drawer>
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
import { CheckCircleIcon, CogIcon } from "@heroicons/vue/outline";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import Drawer from "@/components/Drawer.vue";
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

const route = useRoute();
const { showSuccess, showError } = useToast();

const accessLevelsMachine = createMachine<{
  accessLevel?: AccessLevel;
  drawerVisible: boolean;
  modalVisible: boolean;
}>(
  {
    id: "accessLevelsMachine",
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
            actions: ["showModal"],
          },
        },
      },
      updating: {
        invoke: {
          src: (context, event) => updateAccessLevel(event.accessLevel),
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
          src: (context, event) =>
            createAccessLevel({
              ...event.accessLevel,
              community_id: route.params.community_id,
            }),
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
            actions: ["hideModal"],
          },
          DELETE: {
            target: "deleting",
          },
        },
      },
      deleting: {
        invoke: {
          src: (context, event) =>
            deleteAccessLevel({
              ...event.accessLevel,
              community_id: route.params.community_id,
            }),
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
      assignAccessLevel: assign({
        accessLevel: (context, event) => event.payload.accessLevel,
      }),
      clearAccessLevel: assign({
        accessLevel: (_, __) => undefined,
      }),
      updateAccessLevel: (context, event) => {
        store.communityAccessLevels = store.communityAccessLevels.map(
          (level) => {
            if (level.id === event.data.id) {
              return event.data;
            }
            return level;
          }
        );
        showSuccess({ message: "Access rule updated" });
      },
      addAccessLevel: (context, event) => {
        store.communityAccessLevels.push(event.data);
        showSuccess({ message: "Access rule added" });
      },
      removeAccessLevel: (context, event) => {
        store.communityAccessLevels = store.communityAccessLevels.filter(
          (level) => level.id !== event.data.id
        );
        showSuccess({ message: "Access rule deleted" });
      },
      showError: (context, event) => {
        showError({ message: event?.data?.message || "Something went wrong" });
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
