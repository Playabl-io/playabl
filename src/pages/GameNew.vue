<template>
  <BaseTemplate>
    <div
      v-if="state.value === 'loadCommunities'"
      class="grid place-items-center"
    >
      <LoadingSpinner color="brand-500" />
    </div>
    <div v-if="state.value === 'noCommunities'" class="grid place-items-center">
      <p class="max-w-lg text-center leading-6">
        You don't have creator privileges on any communities. Request this from
        your community organizer, or
        <router-link
          to="/communities/new"
          class="text-brand-500 font-semibold hover:border-b hover:border-solid hover:border-brand-500"
        >
          start your own community!
        </router-link>
      </p>
    </div>
    <ChooseCommunity
      v-if="['chooseCommunity'].includes(state.value as string)"
      :communities="state.context.communities"
      @select="send('SELECT', $event)"
    />
    <div
      v-if="
        ['gameDetails', 'gameSessions', 'submitting'].includes(
          state.value as string,
        )
      "
      class="max-w-2xl mx-auto"
    >
      <Heading level="h4" as="h1"> Create a new game </Heading>
      <div
        class="mt-8 bg-sky-100 dark:bg-indigo-800 rounded-lg border border-solid border-sky-300 dark:border-indigo-900 p-6 text-slate-700 dark:text-brand-100 text-sm"
      >
        <div class="flex items-center">
          <UserGroupIcon class="h-6 w-6 mr-2" />
          <p class="pt-1">{{ state.context.selectedCommunity?.name }}</p>
        </div>
        <LinkButton
          v-if="state.context.communities.length > 1"
          class="mt-2"
          @click="send('CHOOSE_NEW_COMMUNITY')"
        >
          Choose a new community
        </LinkButton>
      </div>
      <div class="grid grid-cols-2 gap-6 my-8">
        <div class="h-1 rounded-xl bg-blue-500" />
        <div
          class="h-1 rounded-xl transition-colors duration-150 ease-out"
          :class="[
            state.value === 'gameSessions' ? 'bg-blue-500' : 'bg-gray-300',
          ]"
        />
      </div>
    </div>
    <form
      v-if="
        ['gameDetails', 'missingDescription'].includes(state.value as string)
      "
      class="grid grid-cols-1 gap-12 max-w-2xl mx-auto relative"
      @submit.prevent="send('ADVANCE')"
    >
      <div v-if="furthestPostingDateIsInPast">
        <p>
          This community has limited game sessions to a date that is in the
          past. Please contact the community manager.
        </p>
        <p class="mt-4 font-semibold">
          Furthest posting date:
          {{ communityPostingLimit?.toLocaleDateString() }}
        </p>
      </div>
      <div v-else class="grid grid-cols-1 gap-8">
        <Heading level="h6" as="h2">Game info</Heading>
        <div
          v-if="state.context.communityEvents.length !== 0"
          class="flex flex-col"
        >
          <FormLabel helper-text="Select an upcoming event">
            Add to event
          </FormLabel>
          <FormSelect
            id="event"
            v-model="eventId"
            :disabled="state.context.communityEvents.length === 0"
          >
            <option value="">Select</option>
            <option
              v-for="event in state.context.communityEvents"
              :key="event.id"
              :value="event.id"
              :selected="String(event.id) === eventId"
            >
              {{ event.title }}
            </option>
          </FormSelect>
        </div>
        <div class="flex flex-col">
          <FormLabel for="title" required> Game title </FormLabel>
          <FormInput id="title" v-model="title" required />
        </div>
        <div class="flex flex-col">
          <FormLabel
            for="system"
            helper-text="Pick one or enter your own"
            required
          >
            Game system
          </FormLabel>
          <FilterDropdown
            v-model="system"
            :options="gameSystemList"
            placeholder="Select or specify a system"
          />
          <a
            href="https://github.com/Playabl-io/playabl/blob/main/src/util/gameSystemList.ts"
            class="text-xs mt-2 mr-auto text-blue-700"
            target="_blank"
          >
            Edit this list on GitHub
          </a>
        </div>
        <div class="flex flex-col">
          <FormLabel for="participantCount" required> Player count </FormLabel>
          <FormInput
            id="participantCount"
            v-model.number="participantCount"
            type="number"
            min="1"
            required
          />
        </div>
        <div class="flex flex-col">
          <FormLabel for="description" required>Description</FormLabel>
          <p v-if="state.value === 'missingDescription'" class="text-red-500">
            Game description is required
          </p>
          <div
            class="bg-white rounded-lg border border-solid border-gray-300 mt-2"
          >
            <TipTapEditor
              v-model="description"
              placeholder="Tell others about the game"
              editor-height="h-96"
              @update:model-value="setFlatDescription"
            />
          </div>
        </div>
        <div class="flex flex-col">
          <FormLabel for="tabletop"> Virtual tabletop </FormLabel>
          <FormInput id="tabletop" v-model="tabletop" />
        </div>
        <div class="flex flex-col">
          <FormLabel>Game cover image</FormLabel>
          <FormFileInput
            class="mt-2"
            :file="existingImageToUse?.src || coverImage"
            @file-change="onFileChange"
            @file-drop="onFileDrop"
            @clear-file="clearFile"
          />
          <LinkButton
            class="text-sm mt-2"
            type="button"
            @click="showGallery = true"
          >
            Or select from your media
          </LinkButton>
          <ImageGalleryModal
            :open="showGallery"
            @close="showGallery = false"
            @select="handleImageSelect"
          />
        </div>
        <Well>
          <div class="flex items-center space-x-2">
            <FormCheckbox id="recording" v-model="isRecorded" />
            <FormLabel class="font-normal" for="recording" :no-margin="true">
              This game may be recorded
            </FormLabel>
          </div>
          <div class="mt-4 flex items-center space-x-2">
            <FormCheckbox id="safety" v-model="usesSafetyTools" />
            <FormLabel class="font-normal" for="safety" :no-margin="true">
              This game will use safety tools
            </FormLabel>
          </div>
          <p class="text-xs text-slate-800 mt-1">
            Not familiar with safety tools? Learn more from the
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://drive.google.com/drive/folders/114jRmhzBpdqkAlhmveis0nmW73qkAZCj"
              class="text-brand-500 hover:underline"
            >
              TTRPG Safety Toolkit
            </a>
          </p>
        </Well>
        <div class="w-full">
          <PrimaryButton class="w-full"> Next </PrimaryButton>
          <p
            v-if="state.value === 'missingDescription'"
            class="text-red-500 mt-1 text-center"
          >
            Please add a game description
          </p>
        </div>
      </div>
    </form>
    <form
      v-if="
        ['gameSessions', 'invalidGameSessions', 'submitting'].includes(
          state.value as string,
        )
      "
      id="secondScreen"
      class="max-w-2xl mx-auto"
      @submit.prevent="send('SUBMIT')"
    >
      <Heading level="h6" as="h2" class="mb-2">Sessions</Heading>
      <Well>
        <p class="text-sm">
          Start by adding sessions for your game. After, if your community
          allows it, you can pre-seat members to any planned sessions. These
          members will be assigned seats in the order you add them, and it is
          not possible to "skip" a seat (i.e. put someone on the waiting list
          and leave a seat open).
        </p>
        <p class="text-sm mt-3">
          You can review your sessions below before finalizing.
        </p>
      </Well>

      <Well v-if="selectedEvent" class="mt-3">
        <p class="text-sm font-semibold">
          Event {{ selectedEvent.title }} runs from
          {{ format(new Date(selectedEvent.start_time), "MMM do hh:mm aa") }}
          till
          {{ format(new Date(selectedEvent.end_time), "MMM do hh:mm aa") }}
        </p>
      </Well>
      <div class="grid gap-6 mt-6">
        <div class="grid gap-6">
          <PrimaryButton type="button" @click="newSessionModalOpen = true">
            Add sessions
          </PrimaryButton>
          <SecondaryButton
            v-if="state.context.selectedCommunity?.allow_pre_seat"
            color="blue"
            :disabled="sessionIds.length === 0"
            type="button"
            @click="preSeatMemberModalOpen = true"
            >Pre-seat a member</SecondaryButton
          >
        </div>
        <div
          aria-live="polite"
          class="relative rounded-lg [min-height:128px] max-w-2xl p-4 bg-gradient-to-br from-emerald-500 to-sky-500"
        >
          <p
            v-if="sessionIds.length === 0"
            class="text-white absolute top-2 left-2 text-sm"
          >
            Added sessions will appear here
          </p>
          <AddSessions
            :sessions="sortedSessions"
            :pre-seat-assignments="preSeatAssignments"
            @delete-session="deleteSession"
          />
        </div>
        <hr class="my-10" />
        <AccessTimes
          :set-by-event="Boolean(selectedEvent)"
          :enabled-levels="state.context.enabledAccessLevels"
          @update="send({ type: 'UPDATE_ENABLED_LEVELS', data: $event })"
        />
        <div class="grid grid-cols-2 gap-6 mt-10">
          <OutlineButton
            type="button"
            class="font-semibold"
            @click="send('BACK')"
          >
            <ArrowSmallLeftIcon class="h-6 w-6" /> Back
          </OutlineButton>
          <PrimaryButton
            :is-loading="state.value === 'submitting'"
            class="w-full"
          >
            Save
          </PrimaryButton>
          <p
            v-if="state.value === 'invalidGameSessions'"
            class="text-red-500 mt-2 col-span-full"
          >
            You must have at least one session and one selected access level.
            Please review your game settings to continue.
          </p>
        </div>
      </div>
    </form>
    <NewSessionsModal
      :open="newSessionModalOpen"
      :not-before="sessionNotBefore"
      :not-after="sessionNotAfter"
      @cancel="newSessionModalOpen = false"
      @close="newSessionModalOpen = false"
      @submit="addSessions"
    />
    <PreSeatMemberModal
      v-if="state.context.selectedCommunity"
      :open="preSeatMemberModalOpen"
      :community-id="state.context.selectedCommunity.id"
      :sessions="sortedSessions"
      :pre-seat-assignments="preSeatAssignments"
      @close="preSeatMemberModalOpen = false"
      @save="preSeatAssignments = $event"
    />
  </BaseTemplate>
</template>
<script setup lang="ts">
import { supabase } from "@/supabase";
import { useRouter } from "vue-router";
import { computed, ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import { UserGroupIcon, ArrowSmallLeftIcon } from "@heroicons/vue/24/outline";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import Heading from "@/components/Heading.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Well from "@/components/Well.vue";
import { NewSession } from "@/typings/Session";
import { loadCreatorAndAdminCommunities } from "@/api/communities";
import { Community } from "@/typings/Community";
import { GAME_DRAFT_STATE, NewGame } from "@/typings/Game";
import AccessTimes from "@/components/Game/AccessTimes.vue";
import ChooseCommunity from "@/components/Game/ChooseCommunity.vue";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import { createGame, publishGame } from "@/api/gamesAndSessions";
import { rsvpTimes, getStartOfToday } from "@/util/time";
import FormFileInput from "@/components/Forms/FormFileInput.vue";
import {
  handleFileChange,
  handleFileDrop,
} from "@/components/Forms/fileInputUtil";
import AddSessions from "@/components/Game/AddSessions.vue";
import { uploadToCoverImageStorage } from "@/api/storage";
import TipTapEditor from "@/components/TipTapEditor.vue";
import ImageGalleryModal from "@/components/Modals/ImageGalleryModal.vue";
import { EnhancedFileObject } from "@/typings/Storage";
import gameSystemList from "@/util/gameSystemList";
import FilterDropdown from "@/components/Dropdown/FilterDropdown.vue";
import { getUpcomingCommunityEvents } from "@/api/communityEvents";
import { CommunityEvent } from "@/typings/CommunityEvent";
import FormSelect from "@/components/Forms/FormSelect.vue";
import { useUrlSearchParams } from "@vueuse/core";
import NewSessionsModal from "@/components/Modals/NewSessionsModal.vue";
import PreSeatMemberModal from "@/components/Modals/PreSeatMemberModal.vue";
import { Member } from "@/typings/Member";
import client from "@/api/client";

const { showSuccess, showError } = useToast();
const router = useRouter();

const startOfToday = getStartOfToday();

const userCreatorCommunities = computed(() => {
  return Object.values(store.userCommunityMembership)
    .filter((membership) => {
      return membership.communityMembership.role_id < 3;
    })
    .map((entry) => entry.community);
});

watch(
  () => userCreatorCommunities.value,
  () => {
    // only noCommunities state responds to this
    // hacky way to update if someone logs in
    send("UPDATE_COMMUNITIES");
  },
);

const newGameMachine = createMachine<{
  communities: Community[];
  selectedCommunity?: Community;
  enabledAccessLevels: number[];
  communityEvents: CommunityEvent[];
}>(
  {
    predictableActionArguments: true,
    context: {
      communities: [],
      selectedCommunity: undefined,
      enabledAccessLevels: [],
      communityEvents: [],
    },
    id: "newGame",
    initial: "loadCommunities",
    states: {
      loadCommunities: {
        invoke: {
          src: loadCreatorAndAdminCommunities,
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
            target: "noCommunities",
            cond: (context) => context.communities.length === 0,
          },
          {
            target: "gameDetails",
            cond: () => {
              const params = new URLSearchParams(window.location.href);
              return Boolean(params.get("community_id"));
            },
            actions: ["assignUrlCommunity"],
          },
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
        on: {
          UPDATE_COMMUNITIES: {
            target: "loadCommunities",
          },
        },
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
        invoke: [
          {
            src: (context) =>
              getAccessLevels(context.selectedCommunity?.id ?? ""),
            onDone: {
              actions: ["updateEnabledAccessLevels"],
            },
          },
          {
            src: (context) =>
              getUpcomingCommunityEvents({
                id: context.selectedCommunity?.id ?? "",
                // creators can see draft events to add games
                draftState: ["DRAFT", "PUBLISHED"],
              }),
            onDone: {
              actions: ["setCommunityEvents"],
            },
          },
        ],
        on: {
          CHOOSE_NEW_COMMUNITY: "chooseCommunity",
          ADVANCE: [
            {
              target: "gameSessions",
              cond: () => description.value !== "",
            },
            {
              target: "missingDescription",
            },
          ],
        },
      },
      missingDescription: {
        on: {
          CHOOSE_NEW_COMMUNITY: "chooseCommunity",
          ADVANCE: [
            {
              target: "gameSessions",
              cond: () => description.value !== "",
            },
            {
              target: "missingDescription",
            },
          ],
        },
      },
      gameSessions: {
        entry: () => {
          window.scrollTo({ top: 0, behavior: "instant" });
        },
        on: {
          CHOOSE_NEW_COMMUNITY: "chooseCommunity",
          BACK: "gameDetails",
          SUBMIT: [
            {
              target: "submitting",
              cond: (context) => {
                if (selectedEvent.value) {
                  return sessionIds.value.length > 0;
                }
                return (
                  sessionIds.value.length > 0 &&
                  context.enabledAccessLevels.length > 0
                );
              },
            },
            {
              target: "invalidGameSessions",
            },
          ],
          UPDATE_ENABLED_LEVELS: {
            actions: ["updateEnabledAccessLevels"],
          },
        },
      },
      invalidGameSessions: {
        on: {
          CHOOSE_NEW_COMMUNITY: "chooseCommunity",
          BACK: "gameDetails",
          SUBMIT: [
            {
              target: "submitting",
              cond: (context) => {
                if (selectedEvent.value) {
                  return sessionIds.value.length > 0;
                }
                return (
                  sessionIds.value.length > 0 &&
                  context.enabledAccessLevels.length > 0
                );
              },
            },
            {
              target: "invalidGameSessions",
            },
          ],
          UPDATE_ENABLED_LEVELS: {
            actions: ["updateEnabledAccessLevels"],
          },
        },
      },
      submitting: {
        invoke: {
          src: submitGame,
          onError: {
            target: "gameSessions",
            actions: ["showErrorToast"],
          },
        },
      },
    },
  },
  {
    actions: {
      assignUrlCommunity: assign({
        selectedCommunity: () => {
          const params = new URLSearchParams(window.location.href);
          const communityId = params.get("community_id");
          if (!communityId) {
            throw new Error("community not found");
          }
          return store.userCommunityMembership[communityId].community;
        },
      }),
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
      setCommunityEvents: assign({
        communityEvents: (context, event) => {
          return event.data;
        },
      }),
      showErrorToast: () => {
        showError({ message: "Unable to create game" });
      },
    },
  },
);

const { state, send } = useMachine(newGameMachine);

const existingImageToUse = ref<{ image: EnhancedFileObject; src: string }>();
const showGallery = ref(false);
function handleImageSelect(selection: {
  image: EnhancedFileObject;
  src: string;
}) {
  existingImageToUse.value = selection;
  showGallery.value = false;
}

const params = useUrlSearchParams();

const title = ref("");
const system = ref("");
const tabletop = ref("");
const description = ref("");
const descriptionAsFlatText = ref("");
const eventId = ref(params.event_id as string);
const sessions = ref<Record<string, NewSession>>({});
const sessionIds = ref<string[]>([]);
const coverImage = ref<File>();
const participantCount = ref<number>();
const isRecorded = ref(false);
const usesSafetyTools = ref(false);

const newSessionModalOpen = ref(false);
const preSeatMemberModalOpen = ref(false);
const preSeatAssignments = ref<{ [id: string]: { members: Member[] } }>({});

const sortedSessions = computed(() => {
  return sessionIds.value
    .map((id) => ({ id, ...sessions.value[id] }))
    .sort((sessionA, sessionB) => sessionA.start_time - sessionB.start_time);
});

const communityPostingLimit = computed(() => {
  if (state.value.context.selectedCommunity?.furthest_posting_date) {
    return new Date(
      state.value.context.selectedCommunity?.furthest_posting_date,
    );
  }
  return undefined;
});

const selectedEvent = computed(() => {
  return state.value.context.communityEvents.find((event) => {
    return String(event.id) === eventId.value;
  });
});

const sessionNotBefore = computed(() => {
  return selectedEvent.value
    ? new Date(selectedEvent.value?.start_time)
    : startOfToday;
});
const sessionNotAfter = computed(() => {
  return selectedEvent.value
    ? new Date(selectedEvent.value?.end_time)
    : communityPostingLimit.value;
});

const furthestPostingDateIsInPast = computed(() => {
  if (!communityPostingLimit.value) return false;
  return getStartOfToday().getTime() > communityPostingLimit.value.getTime();
});

function setFlatDescription(_: string, text: string) {
  descriptionAsFlatText.value = text;
}

function onFileDrop(event: DragEvent) {
  const file = handleFileDrop(event);
  if (file) {
    coverImage.value = file;
    existingImageToUse.value = undefined;
  }
}

function onFileChange(event: Event) {
  const file = handleFileChange(event);
  if (file) {
    coverImage.value = file;
    existingImageToUse.value = undefined;
  }
}

function clearFile() {
  coverImage.value = undefined;
  existingImageToUse.value = undefined;
}

function addSessions(dates: { start: Date; end: Date }[]) {
  if (!store.user || !state.value.context.selectedCommunity?.id) return;
  for (const date of dates) {
    const localId = uuidv4();
    const session = {
      start_time: date.start.getTime(),
      end_time: date.end.getTime(),
      creator_id: store.user.id,
      game_id: 0,
      participant_count: participantCount.value || 0,
      has_openings: true,
      community_id: state.value.context.selectedCommunity.id,
      rsvps: [],
    };
    sessions.value[localId] = session;
    sessionIds.value.push(localId);
  }
}

function deleteSession(sessionId: string) {
  delete sessions.value[sessionId];
  sessionIds.value = sessionIds.value.filter((id) => id !== sessionId);
}

async function submitGame() {
  if (!state.value.context.selectedCommunity?.id || !store.user?.id) return;

  function getLevelsFromStore(ids: number[]) {
    return store.communityAccessLevels.filter((level) =>
      ids.includes(level.id),
    );
  }

  const levels = selectedEvent.value
    ? getLevelsFromStore(selectedEvent.value.event_access_levels ?? [])
    : getLevelsFromStore(state.value.context.enabledAccessLevels);

  const times = rsvpTimes(
    levels,
    selectedEvent.value?.fixed_access_time ?? undefined,
    levels.length > 0 ? "policy" : "global",
  );

  let imagePath;
  if (existingImageToUse.value) {
    imagePath = `${store.user.id}/${existingImageToUse.value.image.name}`;
  } else if (coverImage.value) {
    try {
      imagePath = await uploadToCoverImageStorage({
        file: coverImage.value,
        id: store.user.id,
      });
    } catch (error) {
      showError({ message: "Unable to upload image" });
    }
  }

  const newGame: NewGame = {
    title: title.value,
    description: description.value,
    description_as_flat_text: descriptionAsFlatText.value,
    participant_count: participantCount.value || 0,
    draft_state: GAME_DRAFT_STATE.published,
    community_id: state.value.context.selectedCommunity.id,
    creator_id: store.user.id,
    will_be_recorded: isRecorded.value,
    uses_safety_tools: usesSafetyTools.value,
    system: system.value,
    virtual_tabletop: tabletop.value,
    cover_image: imagePath,
    event_id: selectedEvent.value?.id,
  };
  const game = await createGame(newGame);

  if (import.meta.env.PROD) {
    // send game to SNS
    publishGame(game);
  }

  const sessionsToCreate = sessionIds.value.reduce((acc, id) => {
    const sessionPartial = sessions.value[id];
    if (preSeatAssignments.value[id]?.members.length > 0) {
      sessionPartial.rsvps = preSeatAssignments.value[id]?.members.map(
        (member) => member.id,
      );
    }
    sessionPartial.access_times = JSON.stringify(times);
    sessionPartial.game_id = game.id;
    return acc.concat(sessionPartial);
  }, [] as NewSession[]);

  try {
    const { data } = await supabase
      .from("sessions")
      .insert(sessionsToCreate)
      .select();
    await client.post(`/.netlify/functions/notifyPreSeat`, data);
  } catch (error) {
    showError({
      message:
        "An error occurred setting up the sessions. Please manually review.",
    });
  }

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
  }, [] as number[]);
}
</script>
