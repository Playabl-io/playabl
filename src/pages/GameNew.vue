<template>
  <BaseTemplate>
    <div
      v-if="state.value === 'loadCommunities'"
      class="grid place-items-center"
    >
      <LoadingSpinner color="brand-500" />
    </div>
    <ChooseCommunity
      v-if="state.value === 'chooseCommunity'"
      :communities="state.context.communities"
      @select="send('SELECT', $event)"
    />
    <form
      v-if="['gameDetails', 'submitting'].includes(state.value as string)"
      class="grid grid-cols-1 gap-12 max-w-4xl mx-auto relative"
      @submit.prevent="send('SUBMIT')"
    >
      <Heading level="h4" as="h1"> Create a new game </Heading>
      <div
        class="bg-sky-100 dark:bg-indigo-800 rounded-lg border border-solid border-sky-300 dark:border-indigo-900 p-6 text-slate-700 dark:text-brand-100 text-sm"
      >
        <div class="flex items-center">
          <UserGroupIcon class="h-6 w-6 mr-2" />
          <p class="pt-1">{{ state.context.selectedCommunity?.name }}</p>
        </div>
        <LinkButton
          v-if="state.context.communities.length > 1"
          @click="send('CHOOSE_NEW_COMMUNITY')"
          class="mt-2"
        >
          Choose a new community
        </LinkButton>
      </div>
      <Heading level="h6" as="h2">Game info</Heading>
      <div class="grid grid-cols-1 gap-8">
        <div class="flex flex-col">
          <FormLabel for="title" required> Game title </FormLabel>
          <FormInput v-model="title" id="title" required />
        </div>
        <div class="flex flex-col">
          <FormLabel for="description">Description</FormLabel>
          <FormTextArea v-model="description" id="description" />
        </div>
        <div class="flex flex-col">
          <FormLabel for="participant-count" required>
            Number of players
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
                <DatePicker
                  @select="updateStartDate"
                  :selected="startDate"
                  :not-before="getStartOfToday()"
                />
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
            :disabled="!sessionStartTime || !sessionEndTime"
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
                      new Date(sessions[sessionId].start_time),
                      "EEE, MMM do, h:mm a"
                    )
                  }}
                </li>
                <li>
                  {{
                    format(
                      new Date(sessions[sessionId].end_time),
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
        <AccessTimes
          :enabled-levels="state.context.enabledAccessLevels"
          @update="send({ type: 'UPDATE_ENABLED_LEVELS', data: $event })"
        />
      </div>
      <PrimaryButton :is-loading="state.value === 'submitting'">
        Save
      </PrimaryButton>
    </form>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { supabase } from "@/supabase";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { format, set } from "date-fns";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import { XCircleIcon, UserGroupIcon } from "@heroicons/vue/outline";
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
import { NewSession } from "@/typings/Session";
import { loadJoinedCommunities } from "@/api/communities";
import { Community } from "@/typings/Community";
import { GAME_DRAFT_STATE, NewGame } from "@/typings/Game";
import AccessTimes from "@/components/Game/AccessTimes.vue";
import ChooseCommunity from "@/components/Game/ChooseCommunity.vue";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import { createGame } from "@/api/games";
import { rsvpTimes, getStartOfToday } from "@/util/time";

const { showSuccess, showError } = useToast();
const router = useRouter();

const newGameMachine = createMachine<{
  communities: Community[];
  selectedCommunity?: Community;
  enabledAccessLevels: string[];
}>(
  {
    context: {
      communities: [],
      selectedCommunity: undefined,
      enabledAccessLevels: [],
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
              communities: (context, event) => event.data,
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
            actions: ["assignFirstCommunity"],
          },
        ],
      },
      noCommunities: {
        type: "final",
      },
      chooseCommunity: {
        on: {
          SELECT: {
            target: "gameDetails",
            actions: ["assignCommunity"],
          },
        },
      },
      gameDetails: {
        invoke: {
          src: (context, event) =>
            getAccessLevels(context.selectedCommunity?.id ?? ""),
          onDone: {
            actions: ["updateEnabledAccessLevels"],
          },
        },
        on: {
          CHOOSE_NEW_COMMUNITY: "chooseCommunity",
          SUBMIT: "submitting",
          UPDATE_ENABLED_LEVELS: {
            actions: ["updateEnabledAccessLevels"],
          },
        },
      },
      submitting: {
        invoke: {
          src: submitGame,
          onError: {
            target: "gameDetails",
            actions: ["showErrorToast"],
          },
        },
      },
    },
  },
  {
    actions: {
      assignFirstCommunity: assign({
        selectedCommunity: (context) => context.communities[0],
      }),
      assignCommunity: assign({
        selectedCommunity: (context, event) => event.community,
      }),
      updateEnabledAccessLevels: assign({
        enabledAccessLevels: (context, event) => {
          return event.data;
        },
      }),
      showErrorToast: (context, event) => {
        showError({ message: "Unable to create game" });
      },
    },
  }
);

const { state, send } = useMachine(newGameMachine);

const title = ref("");
const description = ref("");
const sessions = ref<Record<string, NewSession>>({});
const sessionIds = ref<string[]>([]);
const coverImage = ref("");
const participantCount = ref<number>();

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
  if (!store.user) return router.push("/sign-in");
  const [startHours, startMinutes] = sessionStartTime.value.split(":");
  const [endHours, endMinutes] = sessionEndTime.value.split(":");
  const localId = uuidv4();
  sessions.value[localId] = {
    start_time: set(startDate.value, {
      hours: Number(startHours),
      minutes: Number(startMinutes),
    }).getTime(),
    end_time: set(endDate.value, {
      hours: Number(endHours),
      minutes: Number(endMinutes),
    }).getTime(),
    creator_id: store.user.id,
  };
  sessionIds.value.push(localId);
}

function deleteSession(sessionId: string) {
  delete sessions.value[sessionId];
  sessionIds.value = sessionIds.value.filter((id) => id !== sessionId);
}

async function submitGame() {
  if (!state.value.context.selectedCommunity?.id || !store.user?.id) return;
  const levels = store.communityAccessLevels.filter((level) =>
    state.value.context.enabledAccessLevels.includes(level.id)
  );
  const times = rsvpTimes(levels);
  const newGame: NewGame = {
    title: title.value,
    description: description.value,
    participant_count: participantCount.value || 0,
    draft_state: GAME_DRAFT_STATE.published,
    community_id: state.value.context.selectedCommunity.id,
    creator_id: store.user.id,
  };
  const game = await createGame(newGame);

  const sessionsToCreate = sessionIds.value.reduce((acc, id) => {
    const sessionPartial = sessions.value[id];
    sessionPartial.access_times = JSON.stringify(times);
    sessionPartial.game_id = game.id;
    return acc.concat(sessionPartial);
  }, [] as NewSession[]);

  await Promise.all(
    sessionsToCreate.map((session) => {
      return supabase.from("sessions").insert(session);
    })
  );

  showSuccess({ message: "Game created" });
  router.push(`/games/${game.id}`);
}

async function getAccessLevels(communityId: string) {
  const data = await loadCommunityAccessTimes(communityId);
  if (data) {
    store.communityAccessLevels = data;
  }
  return store.communityAccessLevels.reduce((acc, level) => {
    if (level.is_mandatory) {
      acc.push(level.id);
    }
    return acc;
  }, [] as string[]);
}
</script>
