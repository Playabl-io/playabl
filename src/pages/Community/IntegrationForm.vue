<template>
  <DrawerBody
    as="form"
    class="relative h-full flex flex-col"
    @submit.prevent="handleSave"
  >
    <div class="grow flex flex-col p-6">
      <Heading level="h6" as="h2" class="mb-6">
        {{ isExistingIntegration ? "Edit integration" : "New integration" }}
      </Heading>
      <template v-if="!isExistingIntegration">
        <p class="font-semibold mb-2">Integration type</p>
        <div class="grid grid-cols-3 gap-2 mb-1">
          <ToggleRadio
            id="slack"
            :model-value="integration.type"
            name="type"
            value="slack"
            @update:model-value="handleTypeChange"
          >
            Slack
          </ToggleRadio>
          <ToggleRadio
            id="discord"
            :model-value="integration.type"
            name="type"
            value="discord"
            @update:model-value="handleTypeChange"
          >
            Discord
          </ToggleRadio>
          <ToggleRadio
            id="http"
            :model-value="integration.type"
            name="type"
            value="http"
            @update:model-value="handleTypeChange"
          >
            HTTP
          </ToggleRadio>
        </div>
        <p class="text-xs text-slate-700 mb-4">
          Your integration will be created in an inactive state. You can test it
          and activate it after creation.
        </p>
      </template>

      <FormLabel for="name" required> Name </FormLabel>
      <FormInput
        id="name"
        :model-value="integration.name"
        required
        @update:model-value="handleNameChange"
      />
      <IntegrationTriggers
        class="mt-2"
        :triggers="integration.triggers"
        @edit="handleTriggersUpdate"
      />
      <SlackForm
        v-if="integration.type === 'slack' && !isExistingIntegration"
        class="my-4"
        :integration="integration"
        @edit="emit('edit', $event)"
      />
      <div
        v-else-if="
          integration.type === 'discord' || integration.type === 'http'
        "
        class="flex flex-col mt-2"
      >
        <FormLabel for="endpoint" required> Webhook URL </FormLabel>
        <FormInput
          id="endpoint"
          :model-value="integration.endpoint"
          type="url"
          required
          @update:model-value="handleEndpointChange"
        />
        <a
          v-if="integration.type === 'discord'"
          href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
          target="_blank"
          class="text-blue-700 text-sm hover:underline flex mt-1"
        >
          Create your webhook URL in Discord
          <ArrowTopRightOnSquareIcon class="h-5 w-5 ml-1" />
        </a>
      </div>
    </div>
    <DrawerFooter>
      <GhostButton
        v-if="isExistingIntegration"
        type="button"
        class="mr-auto"
        @click="emit('delete', integration)"
      >
        <TrashIcon class="h-5 w-5 text-red-600" />
      </GhostButton>
      <OutlineButton type="button" @click="emit('close')">Cancel</OutlineButton>
      <PrimaryButton v-if="displaySaveButton" :is-loading="saving">
        Save
      </PrimaryButton>
    </DrawerFooter>
  </DrawerBody>
</template>
<script setup lang="ts">
import { PropType, computed } from "vue";
import { Integration, IntegrationTrigger } from "@/typings/Integration";
import DrawerBody from "@/components/DrawerBody.vue";
import DrawerFooter from "@/components/DrawerFooter.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import { TrashIcon } from "@heroicons/vue/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/vue/20/solid";
import ToggleRadio from "@/components/Forms/ToggleRadio.vue";
import Heading from "@/components/Heading.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import IntegrationTriggers from "./IntegrationTriggers.vue";
import SlackForm from "./SlackForm.vue";

const props = defineProps({
  integration: {
    type: Object as PropType<Integration | Omit<Integration, "id">>,
    required: true,
  },
  saving: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "update", "create", "delete", "edit"]);

function handleTypeChange(type: string) {
  emit("edit", { ...props.integration, type });
}

function handleNameChange(name: string) {
  emit("edit", { ...props.integration, name });
}

function handleEndpointChange(endpoint: string) {
  emit("edit", { ...props.integration, endpoint });
}

function handleTriggersUpdate(nextTriggers: IntegrationTrigger[]) {
  const nextIntegration: Integration | Omit<Integration, "id"> = {
    ...props.integration,
    triggers: nextTriggers,
  };
  emit("edit", nextIntegration);
}

const isExistingIntegration = computed(() =>
  Object.hasOwn(props.integration, "id")
);

// Do not show save button when creating a slack integration
const displaySaveButton = computed(() => {
  return props.integration.type !== "slack" || isExistingIntegration.value;
});

function handleSave() {
  emit(isExistingIntegration.value ? "update" : "create", props.integration);
}
</script>
