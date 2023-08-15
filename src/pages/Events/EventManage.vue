<template>
  <div class="grid sm:grid-cols-3 gap-6">
    <div
      class="bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Games</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ eventStore.eventGames?.length }}
      </p>
    </div>
    <div
      class="bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>Sessions</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ counts.sessionCount }}
      </p>
    </div>
    <div
      class="bg-blue-700 text-white grid border border-solid border-gray-300 rounded-lg p-4"
    >
      <p>RSVPs</p>
      <p class="text-2xl place-self-end font-semibold">
        {{ counts.rsvpCount }}
      </p>
    </div>
  </div>
  <div class="grid gap-6 mt-6 items-start">
    <div
      v-if="eventStore.event?.draft_state === 'DRAFT'"
      class="border border-blue-500 rounded-md p-4 bg-blue-100 prose-sm"
    >
      <p class="font-semibold">This event is not published</p>
      <p class="text-sm">
        Until you publish, you can update any details, and game creators in the
        community can add games, but community members will not see the event or
        its games browsing the platorm.
      </p>
      <p class="text-sm">
        Once ready, publish the event and it will be live on the platform.
        Caution, once published you cannot change certain event details
        including:
      </p>
      <ul class="list-disc list-inside">
        <li>Who has access</li>
        <li>When they can RSVP</li>
        <li>Event times</li>
      </ul>
      <div class="flex gap-2 items-center">
        <FormCheckbox id="confirm-publish" v-model="confirmPublish" />
        <FormLabel for="confirm-publish" no-margin
          >I'm ready to publish</FormLabel
        >
      </div>
      <PrimaryButton
        class="mt-3"
        :is-loading="saving"
        :disabled="!confirmPublish"
        @click="publish"
        >Publish</PrimaryButton
      >
    </div>
    <div
      v-if="eventStore.event?.draft_state === 'PUBLISHED'"
      class="border border-blue-500 rounded-md p-4 bg-blue-100"
    >
      <p class="font-semibold mb-3">Published</p>
      <p class="text-sm">
        The event is live and visible. You can update certain settings, or
        cancel the event.
      </p>
    </div>
    <div class="p-4 bg-white rounded-md shadow-sm grid gap-6">
      <Heading level="h6">Details</Heading>
      <div class="flex flex-col">
        <FormLabel required for="title">Title:</FormLabel>
        <FormInput id="title" v-model="form.title" type="text" required />
      </div>
      <div class="flex flex-col">
        <FormLabel for="description">Description</FormLabel>
        <div class="bg-white rounded-lg border border-solid border-gray-300">
          <TipTapEditor
            id="description"
            v-model="form.description"
            placeholder="Event description"
            required
            editor-height="h-96"
          />
        </div>
      </div>
      <div class="flex flex-col">
        <FormLabel
          required
          for="start_date"
          :helper-text="`The earliest time sessions can start, in your timezone (${getUserTimezone()})`"
          >Start Date & Time</FormLabel
        >
        <FormInput
          id="start_date"
          v-model="form.start_time"
          :disabled="isPublished"
          type="datetime-local"
          required
        />
      </div>
      <div class="flex flex-col">
        <FormLabel
          required
          for="end_date"
          :helper-text="`When sessions must be finished by, in your timezone (${getUserTimezone()})`"
          >End Date & Time</FormLabel
        >
        <FormInput
          id="end_date"
          v-model="form.end_time"
          :disabled="isPublished"
          type="datetime-local"
          required
        />
      </div>
      <hr />
      <div class="flex flex-col">
        <FormLabel>Who should have access?</FormLabel>
        <div class="grid gap-6 md:grid-cols-2">
          <RadioCard
            id="everyone"
            v-model="accessGroup"
            :disabled="isPublished"
            name="access-group"
            value="everyone"
            @change="
              () => {
                form.event_access_levels = [];
                form.rsvp_model = 'FIXED';
              }
            "
          >
            <div class="flex flex-col items-center gap-2">
              <p class="font-semibold">Everyone</p>
              <p class="text-slate-700 text-sm text-center">
                All community members will have access to games posted
              </p>
            </div>
          </RadioCard>
          <RadioCard
            id="limited"
            v-model="accessGroup"
            :disabled="isPublished"
            name="access-group"
            value="limited"
          >
            <div class="flex flex-col items-center gap-2">
              <p class="font-semibold">Specific Members</p>
              <p class="text-slate-700 text-sm text-center">
                Select what access policies are required for games added to this
                event
              </p>
            </div>
          </RadioCard>
        </div>
      </div>
      <div v-if="accessGroup === 'limited'" class="flex flex-col">
        <FormLabel>Limit access based on these policies</FormLabel>
        <FormMultiSelect
          v-model="eventAccessLevels"
          :disabled="isPublished"
          label="Select access policies"
          :options="accessOptions"
        />
        <FormError v-if="form.event_access_levels.length === 0"
          >Please select one or more policies</FormError
        >
      </div>
      <hr />
      <div v-if="accessGroup === 'limited'" class="flex flex-col">
        <FormLabel>When should they be able to RSVP?</FormLabel>
        <div class="grid gap-6 md:grid-cols-2">
          <RadioCard
            id="fixed"
            v-model="form.rsvp_model"
            :disabled="isPublished"
            name="access-time"
            value="FIXED"
          >
            <div class="flex flex-col items-center gap-2">
              <p class="font-semibold">At the Same Time</p>
              <p class="text-slate-700 text-sm text-center">
                Set a single time for RSVP access to open to everyone selected
                in the prior step
              </p>
            </div>
          </RadioCard>
          <RadioCard
            id="policy"
            v-model="form.rsvp_model"
            :disabled="isPublished"
            name="access-time"
            value="NORMAL"
          >
            <div class="flex flex-col items-center gap-2">
              <p class="font-semibold">According to Policy</p>
              <p class="text-slate-700 text-sm text-center">
                Each session will compute RSVP time based on the policies
                selected. This is the same as when sessions are scheduled
                normally.
              </p>
            </div>
          </RadioCard>
        </div>
      </div>
      <div v-if="form.rsvp_model === 'FIXED'" class="flex flex-col">
        <FormLabel
          required
          for="rsvp_date"
          :helper-text="`The time that everyone will be able to RSVP for all sessions, in your timezone (${getUserTimezone()})`"
          >RSVP Date Time</FormLabel
        >
        <FormInput
          id="rsvp_date"
          v-model="form.fixed_access_time"
          :disabled="isPublished"
          type="datetime-local"
          required
        />
      </div>
      <div
        v-if="errors.length > 0"
        class="bg-rose-100 text-rose-900 rounded-md p-4"
      >
        <ul class="list-disc list-inside pl-2">
          <li v-for="error in errors" :key="error.message">
            {{ error.message }}
          </li>
        </ul>
      </div>
      <div class="grid grid-cols-2 gap-6">
        <OutlineButton @click="reset">Cancel</OutlineButton>
        <PrimaryButton
          :disabled="errors.length > 0"
          :is-loading="saving"
          @click="maybeUpdate"
          >Update</PrimaryButton
        >
      </div>
    </div>
    <div v-if="false" class="p-4 bg-white rounded-md shadow-sm grid gap-6">
      <Heading level="h6">Cancel Event</Heading>
      <WarningButton :disabled="saving"> Cancel </WarningButton>
    </div>
  </div>
  <BaseModal
    title="Confirm change"
    :open="showConfirmUpdate"
    @close="showConfirmUpdate = false"
  >
    <p class="prose">
      One or more changes will impact the timing or access of the event. This
      will require remapping the access and start time for sessions already
      scheduled. If a session is outside of the new event window, it will be
      rescheduled to be within the time limits. Please direct others to review
      and adjust as needed.
    </p>
    <div class="mt-6 flex justify-end space-x-4">
      <GhostButton @click="showConfirmUpdate = false">Cancel</GhostButton>
      <PrimaryButton :is-loading="saving" @click="update">
        Confirm update
      </PrimaryButton>
    </div>
  </BaseModal>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { eventStore } from "./eventStore";
import BaseModal from "@/components/Modals/BaseModal.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormError from "@/components/Forms/FormError.vue";
import FormMultiSelect from "@/components/Forms/FormMultiSelect.vue";
import TipTapEditor from "@/components/TipTapEditor.vue";
import RadioCard from "@/components/Forms/RadioCard.vue";
import { getUserTimezone } from "@/util/time";
import { format } from "date-fns";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import { eventFormUpdateSchema } from "./eventUtils";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import Heading from "@/components/Heading.vue";
import { updateCommunityEvent } from "@/api/communityEvents";
import * as R from "ramda";
import useToast from "@/components/Toast/useToast";
import WarningButton from "@/components/Buttons/WarningButton.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";

const { showSuccess, showError } = useToast();

const counts = computed(() => {
  if (!eventStore.eventGames) {
    return {
      sessionCount: 0,
      rsvpCount: 0,
    };
  }
  const allRsvps: string[] = [];
  const sessionCount = eventStore.eventGames.reduce((acc, cur) => {
    cur.sessions.forEach((session) => {
      allRsvps.push(...session.rsvps);
    });
    return acc + cur.sessions.length;
  }, 0);
  const uniq = new Set([...allRsvps]);

  return { sessionCount, rsvpCount: uniq.size };
});
const saving = ref(false);
const showConfirmUpdate = ref(false);
const accessOptions = ref<{ label: string; value: number }[]>([]);

const accessGroup = ref<"everyone" | "limited">(
  eventStore.event?.event_access_levels?.length &&
    eventStore.event?.event_access_levels?.length > 0
    ? "limited"
    : "everyone"
);

const confirmPublish = ref(false);

const isPublished = computed(
  () => eventStore.event?.draft_state === "PUBLISHED"
);

function getStartingState() {
  return {
    community_id: eventStore.event?.community_id?.toString(),
    title: eventStore.event?.title ?? "",
    description: eventStore.event?.description ?? "",
    draft_state: eventStore.event?.draft_state,
    event_access_levels: eventStore.event?.event_access_levels ?? [],
    start_time: format(
      eventStore.event?.start_time || new Date(),
      "yyyy-MM-dd'T'HH:mm"
    ),
    end_time: format(
      eventStore.event?.end_time || new Date(),
      "yyyy-MM-dd'T'HH:mm"
    ),
    rsvp_model: eventStore.event?.rsvp_model || "FIXED",
    fixed_access_time: format(
      eventStore.event?.fixed_access_time || new Date(),
      "yyyy-MM-dd'T'HH:mm"
    ),
  };
}

const form = reactive(getStartingState());

function reset() {
  const cleanState = getStartingState();
  form.community_id = cleanState.community_id;
  form.title = cleanState.title;
  form.description = cleanState.description;
  form.event_access_levels = cleanState.event_access_levels;
  form.start_time = cleanState.start_time;
  form.end_time = cleanState.end_time;
  form.rsvp_model = cleanState.rsvp_model;
  form.fixed_access_time = cleanState.fixed_access_time;
}

function getFormSubmitRecord() {
  return {
    id: eventStore.event?.id,
    community_id: form.community_id,
    title: form.title,
    description: form.description,
    draft_state: form.draft_state,
    start_time: new Date(form.start_time).getTime(),
    end_time: new Date(form.end_time).getTime(),
    rsvp_model: form.rsvp_model,
    event_access_levels:
      form.event_access_levels.length > 0
        ? form.event_access_levels
        : undefined,
    fixed_access_time:
      form.rsvp_model === "FIXED"
        ? new Date(form.fixed_access_time ?? "1900-01-01").getTime()
        : undefined,
  };
}

const errors = computed(() => {
  let issues: { message: string }[] = [];
  const record = getFormSubmitRecord();
  const result = eventFormUpdateSchema.safeParse(record);
  if (!result.success) {
    issues = issues.concat(result.error.issues);
  }
  if (
    accessGroup.value === "limited" &&
    form.event_access_levels.length === 0
  ) {
    issues.push({
      message: "1 or more access policies required if access group is limited",
    });
  }
  return issues;
});

const eventAccessLevels = computed({
  get() {
    return (
      form.event_access_levels?.reduce((acc, id) => {
        const option = accessOptions.value.find(
          (option) => option.value === id
        );
        if (option) {
          acc.push(option);
        }
        return acc;
      }, [] as { label: string; value: number }[]) ?? []
    );
  },
  set(newVal) {
    form.event_access_levels = newVal.map((val) => val.value);
  },
});

onMounted(async () => {
  if (!eventStore.event?.community_id) {
    return;
  }
  const data = await loadCommunityAccessTimes(eventStore.event?.community_id);
  if (data) {
    accessOptions.value = data.map((level) => ({
      label: level.name,
      value: level.id,
    }));
  }
});

function publish() {
  form.draft_state = "PUBLISHED";
  maybeUpdate();
}

function maybeUpdate() {
  if (!eventStore.event) {
    throw new Error("No event");
  }
  const record = getFormSubmitRecord();
  const result = eventFormUpdateSchema.safeParse(record);
  if (!result.success) {
    throw new Error("Event is invalid");
  }
  const { data } = result;
  const current = eventStore.event;
  if (
    current.start_time !== data.start_time ||
    current.end_time !== data.end_time ||
    current.fixed_access_time !== data.fixed_access_time ||
    R.difference(
      current.event_access_levels ?? [],
      data.event_access_levels ?? []
    ).length > 0
  ) {
    showConfirmUpdate.value = true;
  } else {
    update();
  }
}

async function update() {
  const record = getFormSubmitRecord();
  const result = eventFormUpdateSchema.safeParse(record);
  if (!result.success) {
    throw new Error("Event is invalid");
  }
  saving.value = true;
  try {
    const { data } = await updateCommunityEvent(result.data);
    eventStore.event = data;
    showSuccess({ message: "Event updated!" });
    showConfirmUpdate.value = false;
  } catch (error) {
    showError({ message: "Unable to update event" });
  }
  saving.value = false;
}
</script>
