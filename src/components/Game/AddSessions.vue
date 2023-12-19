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
        v-for="(session, i) in sessions"
        :key="session.id"
        class="relative flex-shrink-0 rounded-lg p-4 [width:225px] shadow-sm bg-white"
      >
        <div class="absolute top-1 right-1">
          <DismissButton
            label="Delete session"
            type="button"
            @click="emit('deleteSession', session.id)"
          />
        </div>
        <p class="text-xs text-slate-700 font-semibold mb-3">
          Session {{ i + 1 }}
        </p>

        <div class="flex flex-col mb-3">
          <p class="text-sm">Start time</p>
          <p class="">
            {{ format(new Date(session.start_time), "EEE, MMM do, h:mm a") }}
          </p>
        </div>
        <div class="flex flex-col">
          <p class="text-sm">End time</p>
          <p class="">
            {{ format(new Date(session.end_time), "EEE, MMM do, h:mm a") }}
          </p>
        </div>
        <template v-if="preSeatAssignments[session.id]?.members">
          <p class="text-sm mt-3">Pre-Seated</p>
          <div class="flex flex-wrap gap-2">
            <p class="">
              {{
                preSeatAssignments[session.id]?.members
                  .map((member) => member.username || member.email)
                  .join(", ")
              }}
            </p>
          </div>
        </template>
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { format } from "date-fns";
import { NewSession } from "@/typings/Session";
import DismissButton from "../Buttons/DismissButton.vue";
import { Member } from "@/typings/Member";

defineProps({
  sessions: {
    type: Array as PropType<(NewSession & { id: string })[]>,
    required: true,
  },
  preSeatAssignments: {
    type: Object as PropType<{ [id: string]: { members: Member[] } }>,
    required: true,
  },
});

const emit = defineEmits(["deleteSession"]);
</script>
