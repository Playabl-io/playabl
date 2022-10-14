<template>
  <fieldset class="p-4 rounded-lg bg-gray-100 flex flex-col gap-2">
    <p class="text-slate-700">Select what events this integration will send</p>
    <div
      v-for="trigger in triggers"
      :key="trigger.label"
      class="flex items-center gap-4"
    >
      <FormCheckbox
        :id="`${trigger.entity}-${trigger.action}`"
        :model-value="trigger.active"
        name="integration-triggers"
        @update:model-value="handleTriggerChange(trigger, $event)"
      />
      <FormLabel
        :for="`${trigger.entity}-${trigger.action}`"
        no-margin
        class="font-normal"
      >
        {{ trigger.label }}
      </FormLabel>
    </div>
  </fieldset>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import { Integration, IntegrationTrigger } from "@/typings/Integration";

const props = defineProps({
  triggers: {
    type: Object as PropType<Integration["triggers"]>,
    required: true,
  },
});

const emit = defineEmits(["edit"]);

function handleTriggerChange(trigger: IntegrationTrigger, isActive: boolean) {
  const nextTriggers = props.triggers.map((cur) => {
    if (cur.label === trigger.label) {
      return {
        ...trigger,
        active: isActive,
      };
    }
    return cur;
  });
  emit("edit", nextTriggers);
}
</script>
