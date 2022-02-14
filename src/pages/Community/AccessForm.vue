<template>
  <form class="relative h-full flex flex-col" @submit.prevent="handleSave">
    <div class="grow flex flex-col space-y-6 p-6">
      <Heading v-if="props.accessLevel" level="h6" as="h2">
        Edit access level
      </Heading>
      <Heading v-else level="h6" as="h2"> New access level </Heading>
      <div class="flex flex-col">
        <FormLabel for="access-level-title" required> Title </FormLabel>
        <FormInput id="access-level-title" v-model="title" required />
      </div>
      <div class="flex flex-col">
        <FormLabel required> Priority access time </FormLabel>
        <div class="grid grid-cols-2 gap-2">
          <FormInput
            v-model.number="priorityAccessTime"
            type="number"
            required
          />
          <select
            v-model="timeDenomination"
            class="rounded-md border border-solid border-gray-300 text-slate-900 dark:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
            required
          >
            <option value="hours">hours</option>
            <option value="days">days</option>
            <option value="weeks">weeks</option>
          </select>
        </div>
      </div>
      <div class="p-4 rounded-lg bg-gray-100">
        <div class="flex items-center space-x-4">
          <FormCheckbox id="is-mandatory" v-model="isMandatory" />
          <FormLabel class="font-normal" for="is-mandatory">
            Make this access level mandatory for games?
          </FormLabel>
        </div>
        <div class="flex items-center space-x-4 mt-4">
          <FormCheckbox id="apply-to-new-members" v-model="applyOnJoin" />
          <FormLabel class="font-normal" for="apply-to-new-members">
            Automatically grant to members when they join the community?
          </FormLabel>
        </div>
      </div>
    </div>
    <div
      class="grow-0 px-6 py-4 flex justify-end space-x-2 border-t border-solid border-gray-200"
    >
      <GhostButton type="button" class="mr-auto" @click="emit('delete')">
        <TrashIcon class="h-5 w-5 text-red-600" />
      </GhostButton>
      <OutlineButton type="button" @click="emit('close')">Cancel</OutlineButton>
      <PrimaryButton :is-loading="saving">Save</PrimaryButton>
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import {
  AccessLevel,
  ACCESS_LEVEL_TIME_DENOMINATION,
} from "@/typings/AccessLevel";
import { TrashIcon } from "@heroicons/vue/outline";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
const props = defineProps({
  accessLevel: {
    type: Object as () => AccessLevel,
    default: undefined,
  },
  communityId: {
    type: String,
    required: true,
  },
  saving: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "save", "delete"]);

const id = ref(props.accessLevel?.id);
const title = ref(props.accessLevel?.name || "");
const priorityAccessTime = ref(props.accessLevel?.priority_access_time || 0);
const timeDenomination = ref(
  props.accessLevel?.time_denomination || ACCESS_LEVEL_TIME_DENOMINATION.days
);
const isMandatory = ref(props.accessLevel?.is_mandatory || false);
const applyOnJoin = ref(props.accessLevel?.apply_on_join || false);

function handleSave() {
  const updatedAccessLevel: AccessLevel = {
    id: id.value,
    name: title.value,
    priority_access_time: priorityAccessTime.value,
    time_denomination: timeDenomination.value,
    is_mandatory: isMandatory.value,
    community_id: props.communityId,
    apply_on_join: applyOnJoin.value,
  };
  emit("save", {
    accessLevel: updatedAccessLevel,
  });
}
</script>
