<template>
  <Heading level="h6" as="h2" class="mb-2">Allow pre-seating</Heading>
  <p class="text-sm text-slate-700">
    If enabled, allows members to pre-seat other members when creating games and
    sessions. This will bypass any priority access.
  </p>
  <SwitchGroup class="mt-4">
    <div class="flex items-center">
      <SwitchLabel class="mr-4 text-sm font-semibold w-36">{{
        enabled ? "Disable pre-seating" : "Enable pre-seating"
      }}</SwitchLabel>
      <Switch
        v-model="enabled"
        :class="enabled ? 'bg-blue-600' : 'bg-gray-300'"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span
          :class="enabled ? 'translate-x-6' : 'translate-x-1'"
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        />
      </Switch>
    </div>
  </SwitchGroup>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import Heading from "@/components/Heading.vue";
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
import useToast from "@/components/Toast/useToast";
import { updateCommunity } from "@/api/communities";
import { communityStore } from "./communityStore";
import Well from "@/components/Well.vue";

const props = defineProps({
  communityId: {
    type: String,
    required: true,
  },
});

const { showSuccess, showError } = useToast();

const isUpdating = ref(false);
const enabled = ref(communityStore.community.allow_pre_seat);

watch(() => enabled.value, updateSetting);

async function updateSetting() {
  isUpdating.value = true;
  try {
    await updateCommunity({
      communityId: props.communityId,
      update: {
        allow_pre_seat: enabled.value,
      },
    });
    showSuccess({ message: "Setting updated" });
    communityStore.community.allow_pre_seat = enabled.value;
  } catch (error) {
    showError({ message: "Error occurred during update" });
  } finally {
    isUpdating.value = false;
  }
}
</script>
