<template>
  <Popover class="relative">
    <PopoverButton
      type="button"
      class="flex items-center gap-1 rounded-md focus-styles"
    >
      <UserCircleIcon class="w-5 h-5 text-blue-700" />
      <p class="text-sm text-blue-700 border-b border-dashed border-blue-600">
        {{ accessModel.button }}
      </p>
    </PopoverButton>

    <PopoverPanel
      class="absolute z-10 mt-2 bg-white p-4 rounded-md shadow-md border border-solid border-gray-100 w-80"
    >
      <p class="text-sm leading-relaxed">
        {{ accessModel.content }}
      </p>
    </PopoverPanel>
  </Popover>
</template>
<script setup lang="ts">
import { PropType, computed } from "vue";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import { useCanRsvp } from "@/composables/useCanRsvp";
import { Session } from "@/typings/Session";

const props = defineProps({
  sampleSession: {
    type: Object as PropType<Session>,
    required: true,
  },
});

const { accessNeeded, soonestRsvp } = useCanRsvp({
  session: props.sampleSession,
});

const accessModel = computed(() => {
  if (soonestRsvp.value) {
    return {
      button: "You have access",
      content: "You have access to RSVP to this game's sessions",
    };
  } else {
    return {
      button: "You do not have access",
      content: "Access requires one of these: " + accessNeeded.value.join(", "),
    };
  }
});
</script>
