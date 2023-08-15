<template>
  <form class="h-full flex flex-col" @submit.prevent="addSession">
    <div class="grow overflow-auto">
      <div class="grid gap-10 pt-6 px-6">
        <Well v-if="gameStore.game.community_events" class="mt-3">
          <p class="text-sm font-semibold">
            Event {{ gameStore.game.community_events.title }} runs from
            {{
              format(
                new Date(gameStore.game.community_events.start_time),
                "MMM do hh:mm aa"
              )
            }}
            till
            {{
              format(
                new Date(gameStore.game.community_events.end_time),
                "MMM do hh:mm aa"
              )
            }}
          </p>
        </Well>
        <div class="grid gap-8">
          <div>
            <FormLabel>Start date</FormLabel>
            <DatePicker
              :selected="startDate"
              :not-before="sessionNotBefore"
              :not-after="sessionNotAfter"
              @select="updateStartDate"
            />
          </div>
          <div class="flex flex-col">
            <FormLabel for="start-time"> Start time </FormLabel>
            <FormTimeInput
              id="start-time"
              :time="sessionStartTime"
              aria-label="Session start time"
              @set-time="sessionStartTime = $event"
            />
          </div>
        </div>
        <div class="grid gap-8">
          <div>
            <FormLabel> End date </FormLabel>
            <DatePicker
              :selected="endDate"
              :not-before="startDate"
              :not-after="sessionNotAfter"
              @select="updateEndDate"
            />
          </div>
          <div class="flex flex-col">
            <FormLabel for="end-time"> End time </FormLabel>
            <FormTimeInput
              id="end-time"
              :time="sessionEndTime"
              aria-label="Session end time"
              @set-time="sessionEndTime = $event"
            />
          </div>
          <p v-if="dateError" class="text-red-500 font-semibold">
            {{ dateError }}
          </p>
        </div>
      </div>
      <hr class="my-8" />
      <section class="px-8 mb-8">
        <AccessTimes
          :set-by-event="Boolean(gameStore.game.community_events)"
          :enabled-levels="accessLevels"
          grid="grid gap-4"
          @update="accessLevels = $event"
        />
      </section>
    </div>
    <div
      class="grow-0 flex justify-end bg-inherit px-6 py-4 border-t border-solid border-gray-200"
    >
      <PrimaryButton :is-loading="saving" :disabled="Boolean(dateError)"
        >Add session</PrimaryButton
      >
    </div>
  </form>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { set, isBefore, format, isAfter } from "date-fns";
import FormLabel from "@/components/Forms/FormLabel.vue";
import DatePicker from "@/components/Calendar/DatePicker.vue";
import FormTimeInput from "@/components/Forms/FormTimeInput.vue";
import Well from "@/components/Well.vue";
import AccessTimes from "../../components/Game/AccessTimes.vue";
import { getStartOfToday, rsvpTimes } from "@/util/time";
import { store } from "@/store";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import PrimaryButton from "../../components/Buttons/PrimaryButton.vue";
import { supabase } from "@/supabase";
import { NewSession } from "@/typings/Session";
import { log } from "@/util/logger";
import { gameStore } from "./gameStore";
import { selectFromCommunity } from "@/api/communities";

const emit = defineEmits(["addSession"]);

const props = defineProps({
  gameId: {
    type: Number,
    required: true,
  },
  communityId: {
    type: String,
    required: true,
  },
});

const sessionStartTime = ref("");
const sessionEndTime = ref("");
const startDate = ref<Date>(new Date());
const endDate = ref<Date>(new Date());
const accessLevels = ref<number[]>([]);
const saving = ref(false);
const communityPostingLimit = ref<Date>();

const sessionNotBefore = computed(() => {
  return gameStore.game.community_events
    ? new Date(gameStore.game.community_events?.start_time)
    : getStartOfToday();
});
const sessionNotAfter = computed(() => {
  return gameStore.game.community_events
    ? new Date(gameStore.game.community_events?.end_time)
    : communityPostingLimit.value;
});

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
  if (
    gameStore.game.community_events?.start_time &&
    isBefore(
      startDateAndTime.value,
      gameStore.game.community_events?.start_time
    )
  ) {
    return "Session time cannot be before the start of the event";
  }
  if (
    gameStore.game.community_events?.end_time &&
    isAfter(endDateAndTime.value, gameStore.game.community_events?.end_time)
  ) {
    return "Session time cannot end after the end of the event";
  }
  return "";
});

async function addSession() {
  if (!store.user) return;
  const [startHours, startMinutes] = sessionStartTime.value.split(":");
  const [endHours, endMinutes] = sessionEndTime.value.split(":");
  const levels = store.communityAccessLevels.filter((level) =>
    accessLevels.value.includes(level.id)
  );
  const times = rsvpTimes(
    levels,
    gameStore.game.community_events?.fixed_access_time ?? undefined
  );
  const newSession: NewSession = {
    start_time: set(startDate.value, {
      hours: Number(startHours),
      minutes: Number(startMinutes),
    }).getTime(),
    end_time: set(endDate.value, {
      hours: Number(endHours),
      minutes: Number(endMinutes),
    }).getTime(),
    creator_id: store.user.id,
    access_times: JSON.stringify(times),
    game_id: props.gameId,
    community_id: props.communityId,
    has_openings: true,
    rsvps: [],
    participant_count: gameStore.game.participant_count,
  };
  saving.value = true;
  const { data, error } = await supabase
    .from("sessions")
    .insert(newSession)
    .select()
    .single();
  if (data) {
    emit("addSession", data);
  }
  if (error) {
    log({ error });
    saving.value = false;
  }
}

onMounted(async () => {
  await getCommunityPostingDate(props.communityId);
  const mandatory = await getAccessLevels(props.communityId);
  accessLevels.value = mandatory;
});

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
