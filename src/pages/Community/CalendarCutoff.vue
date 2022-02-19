<template>
  <Heading level="h6" as="h2" class="mb-2">Calendar cutoff</Heading>
  <p class="text-sm text-slate-700 mb-4">
    Set a date for how far in advance calendar sessions can be posted. Members
    will not be able to post sessions after this date. Leave blank for no
    cutoff.
  </p>
  <p v-if="dateIsBeforeOrEqualToToday" class="text-red-500 my-2 text-sm">
    Date cannot be today or ealier
  </p>
  <input
    v-model="furthestPostingDate"
    type="date"
    class="rounded-md border-gray-300 text-slate-900 w-full"
  />
  <PrimaryButton
    :disabled="!datesAreNotEqual || dateIsBeforeOrEqualToToday"
    :is-loading="isUpdating"
    class="mt-2 w-full"
    @click="updateCommunityCutoff"
  >
    Update
  </PrimaryButton>
</template>
<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { format, startOfDay, addDays } from "date-fns";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import useToast from "@/components/Toast/useToast";
import { updateCommunity } from "@/api/communities";
import { communityStore } from "./communityStore";

const today = startOfDay(new Date()).getTime();

const props = defineProps({
  communityId: {
    type: String,
    required: true,
  },
  currentCutoff: {
    type: Number as PropType<number | null>,
    default: null,
  },
});

const { showSuccess, showError } = useToast();

const isUpdating = ref(false);
const furthestPostingDate = ref(
  props.currentCutoff && format(new Date(props.currentCutoff), "yyyy-LL-dd")
);

const furthestPostingDateInEpoch = computed(() => {
  if (!furthestPostingDate.value) return undefined;
  const date = new Date(furthestPostingDate.value);
  /**
   * The new Date contrustor with a format of yyyy-mm-dd returns the day before
   * what we would normally read
   */
  const nextDay = addDays(date, 1);
  const epochTimeForStartOfDay = startOfDay(nextDay).getTime();
  return epochTimeForStartOfDay;
});

const datesAreNotEqual = computed(() => {
  if (furthestPostingDateInEpoch.value && props.currentCutoff) {
    return furthestPostingDateInEpoch.value !== props.currentCutoff;
  }
  if (furthestPostingDateInEpoch.value && !props.currentCutoff) {
    return true;
  }
  if (!furthestPostingDateInEpoch.value && props.currentCutoff) {
    return true;
  }
  return false;
});

const dateIsBeforeOrEqualToToday = computed(() => {
  if (!furthestPostingDateInEpoch.value) {
    return false;
  }
  return furthestPostingDateInEpoch.value <= today;
});

async function updateCommunityCutoff() {
  isUpdating.value = true;
  try {
    await updateCommunity({
      communityId: props.communityId,
      update: {
        furthest_posting_date: furthestPostingDateInEpoch.value || null,
      },
    });
    showSuccess({ message: "Calendar cutoff updated" });
    communityStore.community.furthest_posting_date =
      furthestPostingDateInEpoch.value;
  } catch (error) {
    showError({ message: "Unable to update cutoff date" });
  } finally {
    isUpdating.value = false;
  }
}
</script>
