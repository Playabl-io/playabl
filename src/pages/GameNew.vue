<template>
  <BaseTemplate>
    <div
      v-if="state.value === 'loadCommunities'"
      class="grid place-items-center"
    >
      <LoadingSpinner color="brand-500" />
    </div>
    <div
      v-if="state.value === 'chooseCommunity'"
      class="max-w-4xl mx-auto flex flex-col"
    >
      <Heading level="h4" as="h1" class="mb-12"> Choose a community </Heading>
      <Listbox v-model="selectedCommunity">
        <div class="relative mt-1">
          <ListboxButton
            class="relative h-10 w-full py-2 pl-3 pr-10 text-left bg-white text-slate-900 rounded-lg border border-solid border-gray-300 cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-0 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500 sm:text-sm"
          >
            <span class="block truncate">{{
              selectedCommunity?.name || "Select a community"
            }}</span>
            <span
              class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
            >
              <SelectorIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>
          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <ListboxOption
                v-slot="{ active, selected }"
                v-for="community in state.context.communities"
                :key="community.id"
                :value="community"
                as="template"
              >
                <li
                  :class="[
                    active ? 'text-brand-500 bg-violet-100' : 'text-gray-900',
                    'cursor-default select-none relative py-2 pl-10 pr-4',
                  ]"
                >
                  <span
                    :class="[
                      selected ? 'font-medium' : 'font-normal',
                      'block truncate',
                    ]"
                  >
                    {{ community.name }}
                  </span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-500"
                  >
                    <CheckIcon class="w-5 h-5" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
      <PrimaryButton
        @click="send('SELECT')"
        class="w-full mt-6"
        :disabled="!selectedCommunity"
      >
        Next
      </PrimaryButton>
    </div>
    <form
      v-if="state.value === 'gameDetails'"
      class="grid grid-cols-1 gap-12 max-w-4xl mx-auto"
      @submit.prevent="createGame"
    >
      <Heading level="h4" as="h1"> Create a new game </Heading>
      <div
        class="bg-sky-100 rounded-lg border border-solid border-sky-300 p-6 text-brand-500 text-sm"
      >
        <div class="flex items-center">
          <UserGroupIcon class="h-6 w-6 mr-2" />
          <p class="pt-1">{{ selectedCommunity?.name }}</p>
        </div>
        <LinkButton @click="send('CHOOSE_NEW_COMMUNITY')" class="mt-2">
          Choose a new community
        </LinkButton>
      </div>
      <Heading level="h6" as="h2">Game info</Heading>
      <div class="grid grid-cols-1 gap-8">
        <div class="flex flex-col">
          <FormLabel for="title">
            Game title
            <span role="presentation" class="text-red-700 dark:text-red-400">
              *
            </span>
          </FormLabel>
          <FormInput v-model="title" id="title" required />
        </div>
        <div class="flex flex-col">
          <FormLabel for="description">Description</FormLabel>
          <FormTextArea v-model="description" id="description" />
        </div>
        <div class="flex flex-col">
          <FormLabel for="participant-count">
            Number of players
            <span role="presentation" class="text-red-700 dark:text-red-400">
              *
            </span>
          </FormLabel>
          <FormInput
            v-model.number="participantCount"
            type="number"
            min="1"
            id="participant-count"
            required
          />
        </div>
      </div>
      <hr />
      <div>
        <Heading level="h6" as="h2" class="mb-12">Sessions</Heading>
        <div class="grid gap-6">
          <div class="grid lg:grid-cols-2 gap-10">
            <div class="grid gap-8">
              <div>
                <FormLabel>Start date</FormLabel>
                <DatePicker @select="updateStartDate" :selected="startDate" />
              </div>
              <div class="flex flex-col">
                <FormLabel for="start-time"> Start time </FormLabel>
                <FormTimeInput
                  id="start-time"
                  v-model="sessionStartTime"
                  aria-label="Session start time"
                />
              </div>
            </div>
            <div class="grid gap-8">
              <div>
                <FormLabel> End date </FormLabel>
                <DatePicker
                  @select="updateEndDate"
                  :selected="endDate"
                  :not-before="startDate"
                />
              </div>
              <div class="flex flex-col">
                <FormLabel for="end-time"> End time </FormLabel>
                <FormTimeInput
                  id="end-time"
                  v-model="sessionEndTime"
                  aria-label="Session start time"
                />
              </div>
            </div>
          </div>
          <SecondaryButton
            type="button"
            class="my-2 w-full"
            @click="addSession"
          >
            Add session
          </SecondaryButton>
          <div
            aria-live="polite"
            class="h-32 flex space-x-6 overflow-x-auto max-w-4xl pb-4"
          >
            <p
              v-if="sessionIds.length === 0"
              class="prose dark:prose-invert prose-lg"
            >
              Added sessions will appear here
            </p>
            <div
              v-else
              v-for="(sessionId, i) in sessionIds"
              :key="sessionId"
              class="relative flex-shrink-0 rounded-lg border-2 border-solid border-brand-500 dark:border-brand-300 p-4 [width:225px] shadow-sm"
            >
              <div class="absolute top-1 right-1">
                <GhostButton
                  size="small"
                  @click="deleteSession(sessionId)"
                  aria-label="Delete session"
                >
                  <XCircleIcon
                    class="h-4 w-4 stroke-brand-500 dark:stroke-brand-300"
                  />
                </GhostButton>
              </div>
              <p class="text-xs text-slate-700 dark:text-slate-300">
                Session {{ i + 1 }}
              </p>
              <ul
                class="mt-2 text-xs font-semibold list-disc list-inside grid gap-2"
              >
                <li>
                  {{
                    format(
                      parseISO(sessions[sessionId].start_time),
                      "EEE, MMM do, h:mm a"
                    )
                  }}
                </li>
                <li>
                  {{
                    format(
                      parseISO(sessions[sessionId].end_time),
                      "EEE, MMM do, h:mm a"
                    )
                  }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Heading level="h6" as="h2">Access times</Heading>
        <p class="text-sm text-slate-700 dark:text-slate-300">
          Access times are computed automatically based on your community's
          settings
        </p>
      </div>
      <PrimaryButton>Save</PrimaryButton>
    </form>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref } from "vue";
import router from "@/router";
import { v4 as uuidv4 } from "uuid";
import { format, set, parseISO } from "date-fns";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import { supabase } from "@/supabase";
import {
  XCircleIcon,
  CheckIcon,
  SelectorIcon,
  UserGroupIcon,
} from "@heroicons/vue/outline";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import Heading from "@/components/Heading.vue";
import DatePicker from "@/components/Calendar/DatePicker.vue";
import FormTimeInput from "@/components/Forms/FormTimeInput.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { log } from "@/util/logger";
import { Session } from "@/typings/Session";
import { loadJoinedCommunities } from "@/api/communities/communities";
import { Community } from "@/typings/Community";
import { Game, GAME_DRAFT_STATE } from "@/typings/Game";

const newGameMachine = createMachine<{ communities: Community[] }>({
  context: {
    communities: [],
  },
  id: "newGame",
  initial: "loadCommunities",
  states: {
    loadCommunities: {
      invoke: {
        src: loadJoinedCommunities,
        onDone: {
          target: "evaluateCommunities",
          actions: assign({
            communities: (context, event) => {
              console.log(event);
              return event.data;
            },
          }),
        },
      },
    },
    evaluateCommunities: {
      always: [
        {
          target: "chooseCommunity",
          cond: (context) => context.communities.length > 1,
        },
        {
          target: "gameDetails",
          cond: (context) => context.communities.length === 1,
        },
      ],
    },
    noCommunities: {
      type: "final",
    },
    chooseCommunity: {
      on: { SELECT: "gameDetails" },
    },
    gameDetails: {
      on: { CHOOSE_NEW_COMMUNITY: "chooseCommunity", SUBMIT: "submitting" },
    },
    submitting: {
      type: "final",
    },
  },
});

const { state, send } = useMachine(newGameMachine);

const title = ref("");
const description = ref("");
const sessions = ref<Record<string, Session>>({});
const sessionIds = ref<string[]>([]);
const coverImage = ref("");
const participantCount = ref<number>(0);
const draftState = ref<GAME_DRAFT_STATE>(GAME_DRAFT_STATE.draft);
const selectedCommunity = ref<Community>();

const sessionStartTime = ref("");
const sessionEndTime = ref("");
const startDate = ref<Date>(new Date());
const endDate = ref<Date>(new Date());

function updateStartDate(date: Date) {
  startDate.value = date;
  endDate.value = date;
}
function updateEndDate(date: Date) {
  endDate.value = date;
}

function addSession() {
  const [startHours, startMinutes] = sessionStartTime.value.split(":");
  const [endHours, endMinutes] = sessionEndTime.value.split(":");
  const localId = uuidv4();
  sessions.value[localId] = {
    start_time: set(startDate.value, {
      hours: Number(startHours),
      minutes: Number(startMinutes),
    }).toISOString(),
    end_time: set(endDate.value, {
      hours: Number(endHours),
      minutes: Number(endMinutes),
    }).toISOString(),
  };
  sessionIds.value.push(localId);
}

function deleteSession(sessionId: string) {
  delete sessions.value[sessionId];
  sessionIds.value = sessionIds.value.filter((id) => id !== sessionId);
}

async function createGame() {
  if (!selectedCommunity.value?.id) return;
  const newGame: Game = {
    title: title.value,
    description: description.value,
    participant_count: participantCount.value,
    draft_state: draftState.value,
    community_id: selectedCommunity.value?.id,
  };
  try {
    const { data, error } = await supabase
      .from("games")
      .insert(newGame)
      .single();
    if (error) throw error;

    router.push(`/games/${data.id}/manage`);
  } catch (error) {
    log({ error });
  }
}
</script>
