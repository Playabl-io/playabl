<template>
  <BaseTemplate>
    <form class="max-w-2xl mx-auto" @submit.prevent="submitForm">
      <div class="grid gap-6">
        <Heading level="h6"> New event </Heading>
        <p>
          Create a new event. Your new event will be in a draft state and not
          visible to the community until it is published.
        </p>
        <div>
          <FormLabel for="role">Community</FormLabel>
          <FormSelect id="role" v-model="form.community_id" class="mt-1 w-full">
            <option
              v-for="community in store.userManagedCommunities"
              :key="community.id"
              :value="community.id"
              :selected="form.community_id === community.id"
            >
              {{ community.name }}
            </option>
          </FormSelect>
        </div>
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
            type="datetime-local"
            required
          />
          <FormError v-if="endIsBeforeStart">
            End date and time must be after start
          </FormError>
        </div>
        <hr />
        <div class="flex flex-col">
          <FormLabel>Who should have access?</FormLabel>
          <div class="grid gap-6 md:grid-cols-2">
            <RadioCard
              id="everyone"
              v-model="accessGroup"
              name="access-group"
              value="everyone"
              @change="
                () => {
                  eventAccessPolicies = [];
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
              name="access-group"
              value="limited"
            >
              <div class="flex flex-col items-center gap-2">
                <p class="font-semibold">Specific Members</p>
                <p class="text-slate-700 text-sm text-center">
                  Select what access policies are required for games added to
                  this event
                </p>
              </div>
            </RadioCard>
          </div>
        </div>
        <div v-if="accessGroup === 'limited'" class="flex flex-col">
          <FormLabel>Limit access based on these policies</FormLabel>
          <FormMultiSelect
            v-model="eventAccessPolicies"
            label="Select access policies"
            :options="policyOptions"
          />
          <FormError v-if="eventAccessPolicies.length === 0"
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
            type="datetime-local"
            :has-error="Boolean(form.fixed_access_time && rsvpTimeInavlid)"
            required
          />
          <FormError v-if="form.fixed_access_time && rsvpTimeInavlid"
            >The time is not far enough in the future</FormError
          >
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
          <OutlineButton type="button" @click="emit('close')"
            >Cancel</OutlineButton
          >
          <PrimaryButton :is-loading="saving" :disabled="saveDisabled">
            Save
          </PrimaryButton>
        </div>
      </div>
    </form>
  </BaseTemplate>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormError from "@/components/Forms/FormError.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";
import FormMultiSelect from "@/components/Forms/FormMultiSelect.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { getUserTimezone } from "@/util/time";
import { add, isBefore } from "date-fns";
import { createCommunityEvent } from "@/api/communityEvents";
import { CommunityEventInsert } from "@/typings/CommunityEvent";
import TipTapEditor from "@/components/TipTapEditor.vue";
import { store } from "@/store";
import { useRoute, useRouter } from "vue-router";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import RadioCard from "@/components/Forms/RadioCard.vue";
import { loadCommunityAccessTimes } from "@/api/communityAccess";
import { AccessLevel } from "@/typings/AccessLevel";
import { z } from "zod";
import Heading from "@/components/Heading.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { eventFormSchema } from "./eventUtils";

const { showSuccess, showError } = useToast();

const route = useRoute();
const router = useRouter();

const emit = defineEmits(["close", "created"]);

const saving = ref(false);
const errors = ref<z.ZodIssue[]>([]);
const availableAccessPolicies = ref<AccessLevel[]>([]);
const policyOptions = computed(() =>
  availableAccessPolicies.value.map((level) => ({
    label: level.name,
    value: level.id,
  }))
);
const eventAccessPolicies = ref<number[]>([]);
const accessGroup = ref<"everyone" | "limited">("everyone");

const form = reactive({
  community_id:
    (route.query.community_id as string) || store.userManagedCommunities[0]?.id,
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  rsvp_model: "FIXED",
  fixed_access_time: undefined,
});

const endIsBeforeStart = computed(() => {
  if (form.start_time && form.end_time) {
    return (
      form.start_time === form.end_time ||
      isBefore(new Date(form.end_time), new Date(form.start_time))
    );
  }
  return false;
});

const policiesCompleted = computed(() => {
  if (accessGroup.value === "limited") {
    return eventAccessPolicies.value.length > 0;
  } else {
    return true;
  }
});

const saveDisabled = computed(
  () => endIsBeforeStart.value || !policiesCompleted.value
);

const rsvpTimeInavlid = computed(() => {
  if (form.rsvp_model === "FIXED" && form.fixed_access_time) {
    const fiveMinutesFromNow = add(new Date(), {
      minutes: 5,
    });
    return isBefore(new Date(form.fixed_access_time), fiveMinutesFromNow);
  }
  return true;
});

async function getAccessLevels() {
  const data = await loadCommunityAccessTimes(form.community_id);
  if (data) {
    availableAccessPolicies.value = data;
  }
}

watch(
  () => form.community_id,
  () => {
    eventAccessPolicies.value = [];
    getAccessLevels();
  }
);

onMounted(getAccessLevels);

async function submitForm() {
  const record: CommunityEventInsert = {
    community_id: form.community_id,
    draft_state: "DRAFT",
    title: form.title,
    description: form.description,
    start_time: new Date(form.start_time).getTime(),
    end_time: new Date(form.end_time).getTime(),
    rsvp_model: form.rsvp_model,
    event_access_levels:
      accessGroup.value === "limited" ? eventAccessPolicies.value : null,
    fixed_access_time:
      form.rsvp_model === "FIXED"
        ? new Date(form.fixed_access_time ?? "1900-01-01").getTime()
        : null,
  };
  const result = eventFormSchema.safeParse(record);
  if (!result.success) {
    console.error(result.error.issues);
    errors.value = result.error.issues;
    showError({
      message: "Event failed schema check. Please file an issue for this.",
    });
    return;
  }
  saving.value = true;
  try {
    const { data } = await createCommunityEvent(result.data);
    showSuccess({
      message: "Event created!",
    });
    router.push(`/events/${data.id}/overview`);
  } catch (error) {
    log({ error });
    showError({ message: "Unable to save event." });
  } finally {
    saving.value = false;
  }
}
</script>
