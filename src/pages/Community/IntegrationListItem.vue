<template>
  <div class="flex gap-2 justify-between items-center">
    <ListItemButton class="w-full h-min max-w-[11rem]" @click="emit('edit')">
      <p class="font-semibold text-left mb-3">{{ integration.name }}</p>
      <div class="grid lg:grid-cols-2 gap-2">
        <p
          class="text-xs uppercase text-left"
          :class="
            integration.is_active
              ? 'text-emerald-700 font-semibold'
              : 'text-slate-700'
          "
        >
          {{ integration.is_active ? "active" : "inactive" }}
        </p>
        <div class="flex gap-2">
          <Tooltip
            v-if="
              integration.triggers.some(
                (trigger) => trigger.entity === 'user' && trigger.active
              )
            "
          >
            <template #trigger="{ toggleTooltip }">
              <UserIcon
                class="h-6 w-6 text-slate-700"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
            <template #tooltip>User based trigger</template>
          </Tooltip>
          <Tooltip
            v-if="
              integration.triggers.some(
                (trigger) => trigger.entity === 'game' && trigger.active
              )
            "
          >
            <template #trigger="{ toggleTooltip }">
              <TicketIcon
                class="h-6 w-6 text-slate-700"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
            <template #tooltip>
              <p class="w-32">Game based trigger</p>
            </template>
          </Tooltip>
        </div>
      </div>
    </ListItemButton>
    <div class="flex gap-2">
      <SecondaryButton
        @click="integration.is_active ? emit('deactivate') : emit('activate')"
      >
        {{ integration.is_active ? "Deactivate" : "Activate" }}
      </SecondaryButton>
      <SecondaryButton @click="testModalOpen = true">Test</SecondaryButton>
    </div>
    <BaseModal
      title="Send a test message"
      :open="testModalOpen"
      @close="testModalOpen = false"
    >
      <DismissButton
        class="absolute top-4 right-4"
        label="Close"
        @click="testModalOpen = false"
      />
      <div class="mt-6">
        <p>Test your webhook with a sample message from Playabl</p>
        <div v-if="!integration.is_active" class="mt-6">
          <p>
            In order to test the integration, it must be set to
            <span class="uppercase font-semibold">active</span>
          </p>
          <SecondaryButton class="mt-2 w-full" @click="emit('activate')"
            >Activate</SecondaryButton
          >
        </div>
        <PrimaryButton
          v-if="integration.is_active"
          class="mt-6"
          @click="sendTestMessage"
          >Send test message</PrimaryButton
        >
      </div>
    </BaseModal>
  </div>
</template>
<script setup lang="ts">
import { ref, PropType } from "vue";
import { Integration } from "@/typings/Integration";
import { UserIcon, TicketIcon } from "@heroicons/vue/24/outline";
import ListItemButton from "@/components/Buttons/ListItemButton.vue";
import Tooltip from "@/components/Tooltip.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import BaseModal from "@/components/Modals/BaseModal.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import DismissButton from "@/components/Buttons/DismissButton.vue";
import useToast from "@/components/Toast/useToast";
import { testGameIntegration } from "@/api/integrations";
import { store } from "@/store";
import { communityStore } from "./communityStore";

const { showSuccess, showError } = useToast();

const testModalOpen = ref(false);

const props = defineProps({
  integration: {
    type: Object as PropType<Integration>,
    required: true,
  },
});

const emit = defineEmits(["edit", "activate", "deactivate", "test"]);

async function sendTestMessage() {
  if (!store.user?.id) return;
  try {
    if (
      props.integration.triggers.some((trigger) => trigger.entity === "game")
    ) {
      await testGameIntegration({
        communityId: communityStore.community.id,
        userId: store.user.id,
      });
    }
    showSuccess({ message: "Test message sent" });
  } catch (error) {
    showError({ message: "Unable to send test message" });
  }
}
</script>
