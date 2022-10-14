<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between mb-2">
      <Heading level="h6" as="h2">Integrations</Heading>
      <GhostButton
        v-if="integrationsEnabled"
        class="font-normal text-sm"
        @click="send('NEW_INTEGRATION')"
      >
        <PlusCircleIcon class="h-6 w-6 text-slate-700" />
      </GhostButton>
    </div>
    <p class="text-sm text-slate-700 mb-2">
      Power up your community with integrations and never miss when a new member
      joins or a new game is posted
    </p>
    <section class="grow">
      <div v-if="loading" class="h-full grid place-content-center">
        <LoadingSpinner color="brand-500" />
      </div>
      <div v-else-if="integrationsEnabled" class="h-full grid gap-2">
        <div v-if="noIntegrations">
          <PrimaryButton
            class="w-full place-self-center"
            @click="send('NEW_INTEGRATION')"
          >
            Create an integration
          </PrimaryButton>
        </div>
        <IntegrationListItem
          v-for="integration in state.context.integrations"
          :key="integration.id"
          :integration="integration"
          @edit="send({ type: 'EDIT_INTEGRATION', integration })"
          @activate="
            send({
              type: 'SET_ACTIVE_STATUS',
              integration: { ...integration, is_active: true },
            })
          "
          @deactivate="
            send({
              type: 'SET_ACTIVE_STATUS',
              integration: { ...integration, is_active: false },
            })
          "
        />
      </div>
      <div
        v-else-if="state.value === 'notAllowed'"
        class="h-full grid place-content-center"
      >
        <p class="text-slate-700 font-semibold">
          Unlock integrations by going Gold
        </p>
        <BaseButton
          class="text-white font-bold bg-gradient-to-r from-brand-500 to-fuchsia-600 shadow-lg mt-2"
        >
          Upgrade
        </BaseButton>
      </div>
    </section>
    <SideDrawer :open="state.context.drawerVisible" @close="send('CANCEL')">
      <IntegrationForm
        v-if="state.context.editingIntegration"
        :saving="isSaving"
        :integration="state.context.editingIntegration"
        @close="send('CANCEL')"
        @edit="send({ type: 'EDIT_INTEGRATION', integration: $event })"
        @create="
          send({
            type: 'CREATE_INTEGRATION',
          })
        "
        @update="
          send({
            type: 'UPDATE_INTEGRATION',
            integration: $event,
          })
        "
        @delete="send({ type: 'DELETE_INTEGRATION', integration: $event })"
      />
    </SideDrawer>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/vue";
import Heading from "@/components/Heading.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import { PlusCircleIcon } from "@heroicons/vue/24/outline";
import BaseButton from "@/components/Buttons/BaseButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import SideDrawer from "@/components/SideDrawer.vue";
import { Integration } from "@/typings/Integration";
import {
  createCommunityIntegration,
  deleteCommunityIntegration,
  loadCommunityIntegrations,
  updateCommunityIntegration,
} from "@/api/integrations";
import { communityStore } from "./communityStore";
import {
  drawerActions,
  makeSuccessAction,
  toastActions,
} from "@/util/machineActions";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import IntegrationForm from "./IntegrationForm.vue";
import { makeNewIntegration } from "@/util/integrations";
import IntegrationListItem from "./IntegrationListItem.vue";

const communityId = computed(() => communityStore.community.id);
const clientId = import.meta.env.VITE_SLACK_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SLACK_REDIRECT_URI;
const makeSlackHref = (integrationId: string) =>
  `https://slack.com/oauth/v2/authorize?scope=incoming-webhook&redirect_uri=${redirectUri}&client_id=${clientId}&state=${integrationId}`;

const integrationsMachine = createMachine(
  {
    id: "integrationsMachine",
    predictableActionArguments: true,
    schema: {
      context: {} as {
        integrations: Integration[];
        editingIntegration?: Integration | Omit<Integration, "id">;
        drawerVisible: boolean;
      },
      events: {} as
        | { type: "NEW_INTEGRATION" }
        | { type: "CREATE_INTEGRATION" }
        | {
            type: "SET_ACTIVE_STATUS";
            integration: Integration;
          }
        | { type: "UPDATE_INTEGRATION"; integration: Integration }
        | { type: "DELETE_INTEGRATION"; integration: Integration }
        | { type: "CANCEL" }
        | {
            type: "EDIT_INTEGRATION";
            integration: Integration | Omit<Integration, "id">;
          },
    },
    context: {
      integrations: [],
      drawerVisible: false,
    },
    initial: "loadingPremiumStatus",
    states: {
      loadingPremiumStatus: {
        invoke: {
          src: () => {
            // TODO: Check real premium status after that's created
            return new Promise((resolve) => {
              setTimeout(() => resolve(true), 1500);
            });
          },
          onDone: "loadingIntegrations",
          onError: "notAllowed",
        },
      },
      loadingIntegrations: {
        invoke: {
          src: () => loadCommunityIntegrations(communityStore.community.id),
          onDone: {
            target: "viewing",
            actions: ["setIntegrations"],
          },
          onError: {
            target: "errored",
          },
        },
      },
      notAllowed: {
        type: "final",
      },
      viewing: {
        on: {
          NEW_INTEGRATION: {
            target: "creating",
            actions: ["setEmptyIntegration", "showDrawer"],
          },
          EDIT_INTEGRATION: {
            target: "editing",
            actions: ["setEditingIntegration", "showDrawer"],
          },
          SET_ACTIVE_STATUS: {
            target: "updating",
          },
        },
      },
      errored: {
        type: "final",
      },
      creating: {
        on: {
          CANCEL: {
            target: "viewing",
            actions: ["hideDrawer"],
          },
          EDIT_INTEGRATION: {
            target: "creating",
            actions: ["setEditingIntegration"],
          },
          CREATE_INTEGRATION: [
            {
              target: "creatingSlack",
              cond: "isSlackIntegration",
            },
            {
              target: "creatingDiscord",
              cond: "isDiscordIntegration",
            },
            {
              target: "creatingHttp",
            },
          ],
        },
      },
      creatingSlack: {
        invoke: {
          src: "createIntegration",
          onDone: {
            target: "viewing",
            actions: [
              "openSlackAuthorizeWindow",
              "addToIntegrationList",
              "hideDrawer",
              makeSuccessAction("Slack integration created!"),
            ],
          },
          onError: {
            target: "creating",
            actions: ["showError"],
          },
        },
      },
      creatingDiscord: {
        invoke: {
          src: "createIntegration",
          onDone: {
            target: "viewing",
            actions: [
              "addToIntegrationList",
              "hideDrawer",
              makeSuccessAction("Discord integration created!"),
            ],
          },
          onError: {
            target: "creating",
            actions: ["showError"],
          },
        },
      },
      creatingHttp: {
        invoke: {
          src: "createIntegration",
          onDone: {
            target: "viewing",
            actions: [
              "addToIntegrationList",
              "hideDrawer",
              makeSuccessAction("HTTP integration created!"),
            ],
          },
          onError: {
            target: "creating",
            actions: ["showError"],
          },
        },
      },
      editing: {
        on: {
          CANCEL: {
            target: "viewing",
            actions: ["hideDrawer", "clearEditingIntegration"],
          },
          EDIT_INTEGRATION: {
            target: "editing",
            actions: ["setEditingIntegration"],
          },
          UPDATE_INTEGRATION: {
            target: "updating",
          },
          DELETE_INTEGRATION: {
            target: "deleting",
          },
        },
      },
      updating: {
        invoke: {
          src: "updateCommunityIntegration",
          onDone: {
            target: "viewing",
            actions: [
              "updateIntegrationList",
              makeSuccessAction("Integration upated!"),
              "hideDrawer",
              "clearEditingIntegration",
            ],
          },
          onError: {
            target: "editing",
            actions: ["showError"],
          },
        },
      },
      deleting: {
        invoke: {
          src: "deleteCommunityIntegration",
          onDone: {
            target: "viewing",
            actions: [
              "removeFromIntegrationList",
              makeSuccessAction("Integration deleted!"),
              "hideDrawer",
              "clearEditingIntegration",
            ],
          },
          onError: {
            target: "editing",
            actions: ["showError"],
          },
        },
      },
    },
  },
  {
    guards: {
      isSlackIntegration: (context) =>
        context.editingIntegration?.type === "slack",
      isDiscordIntegration: (context) =>
        context.editingIntegration?.type === "discord",
    },
    actions: {
      ...drawerActions,
      ...toastActions,
      setIntegrations: assign({
        integrations: (_, event) => {
          // @ts-expect-error xstate doesn't type invoke done right
          return event.data;
        },
      }),
      setEmptyIntegration: assign({
        editingIntegration: (_, __) => makeNewIntegration(communityId.value),
      }),
      setEditingIntegration: assign({
        editingIntegration: (context, event) => {
          if (event.type === "EDIT_INTEGRATION") {
            return event.integration;
          }
        },
      }),
      // @ts-expect-error xstate why - no params is fine
      clearEditingIntegration: assign({
        editingIntegration: () => {
          return undefined;
        },
      }),
      addToIntegrationList: assign({
        integrations: (context, event) => {
          // @ts-expect-error xstate doesn't type invoke done right
          return context.integrations.concat(event.data);
        },
      }),
      updateIntegrationList: assign({
        integrations: (context, event) => {
          // @ts-expect-error xstate doesn't type invoke done right
          const updatedIntegration = event.data;
          return context.integrations.map((integration) => {
            if (integration.id === updatedIntegration.id) {
              return updatedIntegration;
            }
            return integration;
          });
        },
      }),
      removeFromIntegrationList: assign({
        integrations: (context, event) => {
          // @ts-expect-error xstate doesn't type invoke done right
          const removedIntegration = event.data;
          return context.integrations.filter((integration) => {
            return integration.id !== removedIntegration.id;
          });
        },
      }),
      openSlackAuthorizeWindow: (context, event) => {
        // @ts-expect-error xstate doesn't type invoke done right
        const integrationId = event.data.id;
        window.open(makeSlackHref(integrationId));
      },
    },
    services: {
      createIntegration: async (context) => {
        if (!context.editingIntegration) return;
        return createCommunityIntegration(context.editingIntegration);
      },
      updateCommunityIntegration: async (context, event) => {
        if (
          event.type !== "SET_ACTIVE_STATUS" &&
          event.type !== "UPDATE_INTEGRATION"
        ) {
          throw new Error("called with invalid event");
        }
        return updateCommunityIntegration(event.integration);
      },
      deleteCommunityIntegration: async (context, event) => {
        if (event.type !== "DELETE_INTEGRATION") {
          throw new Error("called with invalid event");
        }
        return deleteCommunityIntegration(event.integration);
      },
    },
  }
);

const { state, send } = useMachine(integrationsMachine);

const loading = computed(() =>
  ["loadingPremiumStatus", "loadingIntegrations"].includes(
    state.value.value as string
  )
);
const integrationsEnabled = computed(
  () =>
    !["loadingPremiumStatus", "loadingIntegrations", "notAllowed"].includes(
      state.value.value as string
    )
);
const isSaving = computed(() =>
  [
    "creatingSlack",
    "creatingDiscord",
    "creatingHttp",
    "updating",
    "deleting",
  ].includes(state.value.value as string)
);
const noIntegrations = computed(
  () => state.value.context.integrations.length === 0
);
</script>
