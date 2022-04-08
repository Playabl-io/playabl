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
      v-if="state.value === 'chooseCommunity'"
      :communities="state.context.communities"
      @select="send('SELECT', $event)"
    />
    <div
      v-if="['gameDetails', 'gameSessions', 'submitting'].includes(state.value as string)"
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
      v-if="['gameDetails'].includes(state.value as string)"
      class="grid grid-cols-1 gap-12 max-w-2xl mx-auto relative"
      @submit.prevent="send('ADVANCE')"
    >
      <div class="grid grid-cols-1 gap-8">
        <Heading level="h6" as="h2">Game info</Heading>
        <div class="flex flex-col">
          <FormLabel for="title" required> Game title </FormLabel>
          <FormInput id="title" v-model="title" required />
        </div>
        <div class="flex flex-col">
          <FormLabel for="system" required> Game system </FormLabel>
          <FilterDropdown
            v-model="system"
            :options="gameSystemList"
            placeholder="Select or specify a system"
          />
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
          <FormLabel for="description">Description</FormLabel>
          <p class="text-xs text-slate-700 mt-1">
            Supports rich text. Highlight words for controls.
          </p>
          <div
            class="bg-white h-96 rounded-lg py-2 border border-solid border-gray-300 mt-2"
          >
            <QuillEditor
              v-model:content="description"
              theme="bubble"
              toolbar="essential"
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
        <div class="p-4 rounded-lg bg-gray-100 flex items-center space-x-2">
          <FormCheckbox id="recording" v-model="isRecorded" />
          <FormLabel class="font-normal" for="recording" :no-margin="true">
            This game may be recorded
          </FormLabel>
        </div>
        <PrimaryButton>
          Next <ArrowSmRightIcon class="h-6 w-6" />
        </PrimaryButton>
      </div>
    </form>
    <form
      v-if="['gameSessions', 'submitting'].includes(state.value as string)"
      id="secondScreen"
      class="max-w-2xl mx-auto"
      @submit.prevent="send('SUBMIT')"
    >
      <Heading level="h6" as="h2" class="mb-2">Sessions</Heading>
      <p class="text-sm text-slate-700 mb-6">All times in your timezone</p>
      <div class="grid gap-6">
        <div class="grid lg:grid-cols-2 gap-10">
          <div class="grid gap-8">
            <div>
              <FormLabel>Start date</FormLabel>
              <DatePicker
                :selected="startDate"
                :not-before="getStartOfToday()"
                :not-after="communityPostingLimit"
                @select="updateStartDate"
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
                :selected="endDate"
                :not-before="startDate"
                :not-after="communityPostingLimit"
                @select="updateEndDate"
              />
            </div>
            <div class="flex flex-col">
              <FormLabel for="end-time"> End time </FormLabel>
              <FormTimeInput
                id="end-time"
                v-model="sessionEndTime"
                aria-label="Session start time"
                :class="{
                  'border-red-500': dateError,
                }"
              />
            </div>
          </div>
        </div>
        <p v-if="dateError" class="text-red-500 mt-2 font-semibold">
          {{ dateError }}
        </p>
        <SecondaryButton
          type="button"
          class="my-2 w-full"
          :disabled="Boolean(dateError) || dateIncomplete"
          @click="addSession"
        >
          Add session
        </SecondaryButton>
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
            :sessions="sessions"
            :session-ids="sessionIds"
            @delete-session="deleteSession"
          />
        </div>
        <AccessTimes
          :enabled-levels="state.context.enabledAccessLevels"
          @update="send({ type: 'UPDATE_ENABLED_LEVELS', data: $event })"
        />
        <div class="grid grid-cols-2 gap-6">
          <OutlineButton
            type="button"
            class="font-semibold"
            @click="send('BACK')"
          >
            <ArrowSmLeftIcon class="h-6 w-6" /> Back
          </OutlineButton>
          <PrimaryButton
            :is-loading="state.value === 'submitting'"
            class="w-full"
          >
            Save
          </PrimaryButton>
        </div>
      </div>
    </form>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { supabase } from "@/supabase";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { isBefore, set } from "date-fns";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/vue";
import {
  UserGroupIcon,
  ArrowSmRightIcon,
  ArrowSmLeftIcon,
} from "@heroicons/vue/outline";
import BaseTemplate from "@/components/BaseTemplate.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import Heading from "@/components/Heading.vue";
import DatePicker from "@/components/Calendar/DatePicker.vue";
import FormTimeInput from "@/components/Forms/FormTimeInput.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { NewSession } from "@/typings/Session";
import {
  loadCreatorAndAdminCommunities,
  selectFromCommunity,
} from "@/api/communities";
import { Community } from "@/typings/Community";
import { GAME_DRAFT_STATE, NewGame } from "@/typings/Game";
import AccessTimes from "@/components/Game/AccessTimes.vue";
import ChooseCommunity from "@/components/Game/ChooseCommunity.vue";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import { createGame } from "@/api/gamesAndSessions";
import { rsvpTimes, getStartOfToday } from "@/util/time";
import FormFileInput from "@/components/Forms/FormFileInput.vue";
import {
  handleFileChange,
  handleFileDrop,
} from "@/components/Forms/fileInputUtil";
import AddSessions from "@/components/Game/AddSessions.vue";
import { uploadToCoverImageStorage } from "@/api/storage";
import { Delta } from "@vueup/vue-quill";
import ImageGalleryModal from "@/components/Modals/ImageGalleryModal.vue";
import { FileObject } from "@/typings/Storage";
import gameSystemList from "@/util/gameSystemList";
import FilterDropdown from "@/components/Dropdown/FilterDropdown.vue";

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
              getCommunityPostingDate(context.selectedCommunity?.id ?? ""),
          },
        ],
        on: {
          CHOOSE_NEW_COMMUNITY: "chooseCommunity",
          ADVANCE: {
            target: "gameSessions",
          },
        },
      },
      gameSessions: {
        entry: () => {
          document
            .getElementById("app")
            ?.scrollTo({ top: 0, behavior: "smooth" });
        },
        on: {
          CHOOSE_NEW_COMMUNITY: "chooseCommunity",
          BACK: "gameDetails",
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
            target: "gameSessions",
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
      showErrorToast: () => {
        showError({ message: "Unable to create game" });
      },
    },
  }
);

const { state, send } = useMachine(newGameMachine);

const existingImageToUse = ref<{ image: FileObject; src: string }>();
const showGallery = ref(false);
function handleImageSelect(selection: { image: FileObject; src: string }) {
  existingImageToUse.value = selection;
  showGallery.value = false;
}

const title = ref("");
const system = ref("");
const tabletop = ref("");
const description = ref<Delta>();
const sessions = ref<Record<string, NewSession>>({});
const sessionIds = ref<string[]>([]);
const coverImage = ref<File>();
const participantCount = ref<number>();
const isRecorded = ref(false);

const sessionStartTime = ref("");
const sessionEndTime = ref("");
const startDate = ref<Date>(new Date());
const endDate = ref<Date>(new Date());

const communityPostingLimit = ref<Date>();

function updateStartDate(date: Date) {
  startDate.value = date;
  if (startDate.value.getTime() > endDate.value.getTime()) {
    endDate.value = date;
  }
}
function updateEndDate(date: Date) {
  endDate.value = date;
}

const startDateAndTime = computed(() => {
  if (!sessionStartTime.value || !startDate.value) return 0;
  const [startHours, startMinutes] = sessionStartTime.value.split(":");
  return set(startDate.value, {
    hours: Number(startHours),
    minutes: Number(startMinutes),
  }).getTime();
});

const endDateAndTime = computed(() => {
  if (!sessionEndTime.value || !endDate.value) return 0;
  const [endHours, endMinutes] = sessionEndTime.value.split(":");
  return set(endDate.value, {
    hours: Number(endHours),
    minutes: Number(endMinutes),
  }).getTime();
});

const dateError = computed(() => {
  if (!startDateAndTime.value || !endDateAndTime.value) {
    return "";
  }
  if (isBefore(endDateAndTime.value, startDateAndTime.value)) {
    return "End date and time cannot be before start date and time";
  }
  return "";
});

const dateIncomplete = computed(() => {
  return startDateAndTime.value === 0 || endDateAndTime.value === 0;
});

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

function addSession() {
  if (!store.user || !state.value.context.selectedCommunity?.id) return;
  const localId = uuidv4();
  sessions.value[localId] = {
    start_time: startDateAndTime.value,
    end_time: endDateAndTime.value,
    creator_id: store.user.id,
    game_id: 0,
    participant_count: participantCount.value || 0,
    has_openings: true,
    community_id: state.value.context.selectedCommunity.id,
    rsvps: [],
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

  let imagePath;
  if (existingImageToUse.value) {
    imagePath = `${store.user.id}/${existingImageToUse.value.image.name}`;
  } else if (coverImage.value) {
    imagePath = await uploadToCoverImageStorage({
      file: coverImage.value,
      id: store.user.id,
    });
  }

  const newGame: NewGame = {
    title: title.value,
    description: JSON.stringify(description.value),
    participant_count: participantCount.value || 0,
    draft_state: GAME_DRAFT_STATE.published,
    community_id: state.value.context.selectedCommunity.id,
    creator_id: store.user.id,
    will_be_recorded: isRecorded.value,
    system: system.value,
    virtual_tabletop: tabletop.value,
    cover_image: imagePath,
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

async function getCommunityPostingDate(communityId: string) {
  const data = await selectFromCommunity({
    communityId,
    select: "furthest_posting_date",
  });
  if (data?.furthest_posting_date) {
    communityPostingLimit.value = new Date(data.furthest_posting_date);
  }
}
</script>
