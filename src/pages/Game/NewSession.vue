<template>
  <form class="h-full flex flex-col" @submit.prevent="addSession">
    <div class="grow overflow-auto">
      <div class="grid gap-10 pt-6 px-6">
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
              required
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
              required
            />
          </div>
        </div>
      </div>
      <hr class="my-8" />
      <section class="px-8 mb-8">
        <AccessTimes
          :enabled-levels="accessLevels"
          grid="grid gap-4"
          @update="accessLevels = $event"
        />
      </section>
    </div>
    <div
      class="grow-0 flex justify-end bg-inherit px-6 py-4 border-t border-solid border-gray-200"
    >
      <PrimaryButton :is-loading="saving">Add session</PrimaryButton>
    </div>
  </form>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { set } from "date-fns";
import FormLabel from "@/components/Forms/FormLabel.vue";
import DatePicker from "@/components/Calendar/DatePicker.vue";
import FormTimeInput from "@/components/Forms/FormTimeInput.vue";
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

function updateStartDate(date: Date) {
  startDate.value = date;
  if (startDate.value.getTime() > endDate.value.getTime()) {
    endDate.value = date;
  }
}
function updateEndDate(date: Date) {
  endDate.value = date;
}

async function addSession() {
  if (!store.user) return;
  const [startHours, startMinutes] = sessionStartTime.value.split(":");
  const [endHours, endMinutes] = sessionEndTime.value.split(":");
  const levels = store.communityAccessLevels.filter((level) =>
    accessLevels.value.includes(level.id)
  );
  const times = rsvpTimes(levels);
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
  if (data) {
    communityPostingLimit.value = new Date(data.furthest_posting_date);
  }
}
</script>
