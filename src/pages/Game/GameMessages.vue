<template>
  <div class="h-full message-window flex flex-col">
    <div
      ref="scrollable"
      class="grid gap-6 overflow-auto rounded-lg px-4 py-2 relative"
      @scroll="setWillScroll"
    >
      <transition-group
        enter-active-class="transform-gpu duration-300 ease-out"
        leave-active-class="absolute transform-gpu duration-200"
        enter-from-class="opacity-0 scale-70"
        leave-to-class="opacity-0 scale-70"
        enter-to-class="opacity-1 scale-100"
        leave-from-class="opacity-1 scale-100"
        move-class="transform-gpu duration-300 ease-in"
        @after-enter="checkScrollPosition"
      >
        <LoadingSpinner v-if="loading" color="brand-500" class="mx-auto" />
        <template v-else-if="messages.length > 0">
          <div
            v-for="message in messages"
            :id="message.id"
            :key="message.id"
            class="rounded-2xl w-fit p-4"
            :class="[
              message.from === userId
                ? message.failedToSend
                  ? 'bg-rose-100 rounded-br-sm ml-auto'
                  : 'bg-sky-200/60 ml-auto rounded-br-sm'
                : 'bg-gray-200/60 rounded-bl-sm',
            ]"
          >
            <UserBadge
              :username="
                profilesById[message.from].username ||
                profilesById[message.from].email
              "
              :avatar-url="profilesById[message.from].avatar_url"
              :pronouns="profilesById[message.from].pronouns"
              size="small"
            />
            <TipTapDisplay :content="message.message" class="mt-2" />
            <LinkButton
              v-if="message.failedToSend"
              class="text-xs text-slate-600 mt-1"
              @click="
                retryMessage({ id: message.id, message: message.message })
              "
            >
              Unable to send. Click to try again.
            </LinkButton>
            <p v-else class="text-xs text-slate-600 mt-1">
              {{ formatRelative(new Date(message.created_at), now) }}
            </p>
          </div>
        </template>
        <div v-else>No messages</div>
      </transition-group>
      <button
        v-if="!loading && messages.length > 0"
        class="rounded-lg p-2 mx-auto w-fit sticky bottom-2 inset-x-0 bg-indigo-500 text-white"
        :class="{
          hidden: willScroll,
        }"
        @click="scrollToLatest"
      >
        Scroll to latest
      </button>
    </div>
    <div class="mt-2">
      <form class="flex gap-2 items-center shrink-0">
        <TipTapReply
          v-model="content"
          class="grow basis-0"
          :send-shortcut="sendShortcut"
          @submit="sendMessage"
        />
        <button
          class="rounded-full h-10 w-10 grid place-content-center hover:bg-gray-200/60"
        >
          <PaperAirplaneIcon class="w-5 h-5 rotate-90" />
        </button>
      </form>
      <div class="mt-2 pl-1 pr-2 flex items-start gap-2">
        <Tooltip>
          <template #trigger="{ toggleTooltip }">
            <Switch
              :model-value="sendShortcut === 'enter'"
              :class="
                sendShortcut === 'enter' ? 'bg-indigo-400' : 'bg-gray-200'
              "
              class="focus-styles relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              @update:model-value="toggleSendShortcut"
              @mouseenter="toggleTooltip"
              @mouseleave="toggleTooltip"
              @focus="toggleTooltip"
              @blur="toggleTooltip"
            >
              <span class="sr-only">Toggle send shortcut</span>
              <span
                aria-hidden="true"
                :class="
                  sendShortcut === 'enter' ? 'translate-x-6' : 'translate-x-0'
                "
                class="pointer-events-none h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out grid place-content-center"
              >
                <PaperAirplaneIcon class="h-3 w-3 text-slate-700 rotate-90" />
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
              v-model="playAudio"
              :class="playAudio ? 'bg-pink-400' : 'bg-gray-200'"
              class="focus-styles relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
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
  </div>
</template>
<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { onMounted, onUnmounted, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { formatRelative } from "date-fns";
import { Switch } from "@headlessui/vue";
import { PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import { MusicalNoteIcon } from "@heroicons/vue/20/solid";
import { loadProfile } from "@/api/profiles";
import UserBadge from "@/components/UserBadge.vue";
import TipTapReply from "@/components/TipTapReply.vue";
import TipTapDisplay from "@/components/TipTapDisplay.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { gameStore } from "./gameStore";
import { GameMessage, Message } from "@/typings/Message";
import { store } from "@/store";
import { loadMessages, sendMessageAboutGame } from "@/api/messages";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";
import Tooltip from "@/components/Tooltip.vue";
import useToast from "@/components/Toast/useToast";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import { Profile } from "@/typings/Profile";

const { showError } = useToast();

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
const playAudio = useLocalStorage("play-new-message-audio", true);
const alertAudo = new Audio("/notification_simple-02.wav");

const gameId = gameStore.game.id;
const userId = store.user?.id;

const loading = ref(true);

const content = ref();
const profilesById = ref<Record<string, Profile>>({});
const messages = ref<Message[]>([]);
const now = new Date();
const scrollable = ref<HTMLDivElement>();
const willScroll = ref(false);

let subscription: RealtimeSubscription;
onMounted(async () => {
  const gameMessages = await loadMessages(gameId);
  if (gameMessages) {
    messages.value = gameMessages;
    const messageUsers = gameMessages.reduce((acc, cur) => {
      acc.push(cur.from);
      acc.push(...cur.to);
      return acc;
    }, [] as string[]);
    const dedupedUsers = [...new Set(messageUsers)];
    const users = await Promise.all(dedupedUsers.map(loadProfile));
    profilesById.value = users.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});
  }
  loading.value = false;
  subscription = supabase
    .from(`messages:topic_id=eq.${gameId}`)
    .on("INSERT", (payload) => {
      if (payload.new.from === store.user?.id) return;
      messages.value = messages.value.concat(payload.new);
      if (playAudio.value) {
        alertAudo.play();
      }
    })
    .subscribe();
});

onUnmounted(() => {
  supabase.removeSubscription(subscription);
});

async function retryMessage({ id, message }: { id: string; message: string }) {
  try {
    await sendMessageAboutGame({
      message,
      group: "all",
      gameId,
    });
    messages.value = messages.value.map((cur) => {
      if (cur.id === id) {
        return {
          ...cur,
          failedToSend: false,
        };
      }
      return cur;
    });
  } catch (error) {
    showError({ message: "Unable to send message " });
  }
}

async function sendMessage() {
  const tempId = uuidv4();
  try {
    const newMessage: GameMessage = {
      id: tempId,
      message: content.value,
      from: store.user?.id ?? "",
      to: [],
      record_type: "text",
      topic_id: String(gameId),
      topic_type: "game",
      created_at: new Date().toISOString(),
    };
    messages.value = messages.value.concat(newMessage);
    const message = content.value;
    content.value = "";
    await sendMessageAboutGame({
      message,
      group: "all",
      gameId,
    });
  } catch (error) {
    messages.value = messages.value.map((message) => {
      if (message.id === tempId) {
        return {
          ...message,
          failedToSend: true,
        };
      }
      return message;
    });
  }
}

function setWillScroll() {
  if (!scrollable.value) return;
  willScroll.value =
    Math.abs(
      scrollable.value.scrollHeight -
        scrollable.value.clientHeight -
        scrollable.value.scrollTop
    ) < 75;
}

function checkScrollPosition() {
  if (willScroll.value) {
    scrollToLatest();
  }
}

function scrollToLatest() {
  const lastMessage = messages.value[messages.value.length - 1];
  const element = document.getElementById(lastMessage.id);
  element?.scrollIntoView({ behavior: "smooth" });
  willScroll.value = false;
}
</script>
<style scoped>
.message-window {
  max-height: calc(100vh - 200px);
}
</style>
