<template>
  <div>
    <form class="flex gap-2 items-center shrink-0">
      <TipTapReply
        v-model="content"
        class="grow basis-0"
        :send-shortcut="sendShortcut"
        @submit="sendMessage"
      />
      <button
        class="rounded-full h-10 w-10 grid place-content-center hover:bg-gray-200/60"
        type="button"
        @click="sendMessage"
      >
        <PaperAirplaneIcon class="w-5 h-5" />
      </button>
    </form>
    <div class="mt-2 flex items-start gap-2">
      <Tooltip>
        <template #trigger="{ setTooltipVisible, setTooltipHidden }">
          <Switch
            :model-value="sendShortcut === 'enter'"
            :class="sendShortcut === 'enter' ? 'bg-indigo-400' : 'bg-gray-200'"
            class="focus-styles relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            @update:model-value="toggleSendShortcut"
            @mouseenter="setTooltipVisible"
            @mouseleave="setTooltipHidden"
            @focus="setTooltipVisible"
            @blur="setTooltipHidden"
          >
            <span class="sr-only">Toggle send shortcut</span>
            <span
              aria-hidden="true"
              :class="
                sendShortcut === 'enter' ? 'translate-x-6' : 'translate-x-0'
              "
              class="pointer-events-none h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out grid place-content-center"
            >
              <PaperAirplaneIcon class="h-3 w-3 text-slate-700" />
            </span>
          </Switch>
        </template>
        <template #tooltip>
          {{
            sendShortcut === "enter"
              ? "Enter sends message"
              : "Enter adds new line"
          }}
        </template>
      </Tooltip>
      <Tooltip>
        <template #trigger="{ toggleTooltip }">
          <Switch
            :model-value="playAudio"
            :class="playAudio ? 'bg-pink-400' : 'bg-gray-200'"
            class="focus-styles relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            @update:model-value="updatePlayAudio"
            @mouseenter="toggleTooltip"
            @mouseleave="toggleTooltip"
            @focus="toggleTooltip"
            @blur="toggleTooltip"
          >
            <span class="sr-only">Play audio on new message</span>
            <span
              aria-hidden="true"
              :class="playAudio ? 'translate-x-6' : 'translate-x-0'"
              class="pointer-events-none h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out grid place-content-center"
            >
              <MusicalNoteIcon class="h-3 w-3 text-slate-700" />
            </span>
          </Switch>
        </template>
        <template #tooltip>
          {{
            playAudio
              ? "Audio will play on new message"
              : "Audio will not play on new message"
          }}
        </template>
      </Tooltip>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { Switch } from "@headlessui/vue";
import { useLocalStorage } from "@vueuse/core";
import { PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import { MusicalNoteIcon } from "@heroicons/vue/20/solid";
import TipTapReply from "@/components/TipTapReply.vue";
import Tooltip from "@/components/Tooltip.vue";

defineProps({
  playAudio: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["sendMessage", "updatePlayAudio"]);

const content = ref();

const sendShortcut = useLocalStorage<"enter" | "enterWithModifier">(
  "message-send-shortcut",
  "enter"
);

function toggleSendShortcut() {
  if (sendShortcut.value === "enter") {
    sendShortcut.value = "enterWithModifier";
  } else {
    sendShortcut.value = "enter";
  }
}

function sendMessage() {
  emit("sendMessage", content.value);
  content.value = "";
}

function updatePlayAudio(val: boolean) {
  emit("updatePlayAudio", val);
}
</script>
