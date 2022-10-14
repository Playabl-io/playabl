<template>
  <div class="flex flex-col">
    <p>
      You'll now be taken to Slack to install the Playabl app to your workspace.
      Follow the prompts to choose what channel it will post to, and grant it
      permissions.
    </p>
    <div class="flex justify-center mt-4">
      <AddToSlackButton
        :disabled="integration.triggers.every((trigger) => !trigger.active)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { Integration } from "@/typings/Integration";

import AddToSlackButton from "./AddToSlackButton.vue";

defineProps({
  integration: {
    type: Object as PropType<Integration | Omit<Integration, "id">>,
    required: true,
  },
});
</script>
