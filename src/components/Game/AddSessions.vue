<template>
  <div class="relative grid sm:grid-cols-2 justify-items-center gap-6">
    <transition-group
      enter-active-class="transform-gpu duration-300 ease-out"
      leave-active-class="absolute transform-gpu duration-200"
      enter-from-class="opacity-0 scale-70"
      leave-to-class="opacity-0 scale-70"
      enter-to-class="opacity-1 scale-100"
      leave-from-class="opacity-1 scale-100"
      move-class="transform-gpu duration-300 ease-in"
    >
      <div
        v-for="(sessionId, i) in sessionIds"
        :key="sessionId"
        class="relative flex-shrink-0 rounded-lg p-4 [width:225px] shadow-sm bg-white"
      >
        <div class="absolute top-1 right-1">
          <DismissButton
            label="Delete session"
            type="button"
            @click="emit('deleteSession', sessionId)"
          />
        </div>
        <p class="text-xs text-slate-700 dark:text-slate-300">
          Session {{ i + 1 }}
        </p>
        <ul class="mt-2 text-xs font-semibold list-disc list-inside grid gap-2">
          <li>
            {{
              format(
                new Date(sessions[sessionId].start_time),
                "EEE, MMM do, h:mm a"
              )
            }}
          </li>
          <li>
            {{
              format(
                new Date(sessions[sessionId].end_time),
                "EEE, MMM do, h:mm a"
              )
            }}
          </li>
        </ul>
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { format } from "date-fns";
import { NewSession } from "@/typings/Session";
import DismissButton from "../Buttons/DismissButton.vue";

defineProps({
  sessions: {
    type: Object as PropType<Record<string, NewSession>>,
    required: true,
  },
  sessionIds: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

const emit = defineEmits(["deleteSession"]);
</script>
