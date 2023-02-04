<template>
  <form class="h-full flex flex-col" @submit.prevent="handleUpdate">
    <div class="grow overflow-auto py-6 px-6 flex flex-col">
      <Heading as="h3" level="h6">Update session</Heading>
      <LoadingSpinner v-if="loading" color="brand-500" />
      <div v-else class="grid gap-10 pt-6">
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
              :not-before="startOfDay(startDate)"
              :not-after="communityPostingLimit"
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
    </div>
    <div
      class="grow-0 flex justify-end space-x-4 bg-inherit p-6 border-t border-solid border-gray-200"
    >
      <OutlineButton type="button" @click="emit('close')">
        Cancel
      </OutlineButton>
      <PrimaryButton :is-loading="saving || loading">Save</PrimaryButton>
    </div>
  </form>
</template>
<script setup lang="ts">
import { computed, ref, PropType, onMounted } from "vue";
import { set, isBefore, format, startOfDay } from "date-fns";
import Heading from "@/components/Heading.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import DatePicker from "@/components/Calendar/DatePicker.vue";
import FormTimeInput from "@/components/Forms/FormTimeInput.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import { Session } from "@/typings/Session";
import { updateSession } from "@/api/gamesAndSessions";
import useToast from "@/components/Toast/useToast";
import { gameStore } from "./gameStore";
import { selectFromCommunity } from "@/api/communities";
import { getStartOfToday } from "@/util/time";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const { showSuccess, showError } = useToast();

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true,
  },
  communityId: {
    type: String as PropType<Session["community_id"]>,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const loading = ref(true);
const saving = ref(false);
const startDate = ref<Date>(new Date(props.session.start_time));
const endDate = ref<Date>(new Date(props.session.end_time));
const formattedStartTime = format(startDate.value, "HH:mm");
const formattedEndTime = format(endDate.value, "HH:mm");
const sessionStartTime = ref(formattedStartTime);
const sessionEndTime = ref(formattedEndTime);
const communityPostingLimit = ref<Date>();

onMounted(async () => {
  await getCommunityPostingDate(props.communityId);
  loading.value = false;
});

async function getCommunityPostingDate(communityId: string) {
  const data = await selectFromCommunity({
    communityId,
    select: "furthest_posting_date",
  });
  if (data?.furthest_posting_date) {
    communityPostingLimit.value = new Date(data.furthest_posting_date);
  }
}

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

async function handleUpdate() {
  const update: Partial<Session> = {
    start_time: startDateAndTime.value,
    end_time: endDateAndTime.value,
  };
  saving.value = true;
  try {
    await updateSession(props.session.id, update);
    gameStore.sessions = gameStore.sessions.map((session) => {
      if (session.id === props.session.id) {
        return Object.assign(session, update);
      }
      return session;
    });
    showSuccess({ message: "Session updated" });
    emit("close");
  } catch (error) {
    showError({ message: "Unable to update session" });
  } finally {
    saving.value = false;
  }
}
</script>
