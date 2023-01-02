<template>
  <div class="h-full flex flex-col">
    <MessageReply
      :play-audio="playAudio"
      @send-message="sendMessage"
      @update-play-audio="setPlayAudio"
    />
    <div class="grid gap-6 rounded-lg mt-6 relative">
      <transition-group
        enter-active-class="transform-gpu duration-300 ease-out"
        leave-active-class="absolute transform-gpu duration-200"
        enter-from-class="opacity-0 scale-70"
        leave-to-class="opacity-0 scale-70"
        enter-to-class="opacity-1 scale-100"
        leave-from-class="opacity-1 scale-100"
        move-class="transform-gpu duration-300 ease-in"
      >
        <LoadingSpinner v-if="loading" color="brand-500" class="mx-auto" />
        <template v-else-if="messages.length > 0">
          <ChatMessage
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :user-id="store.user?.id || ''"
            :profiles-by-id="profilesById"
            @retry-message="retryMessage"
          />
        </template>
        <div v-else>No messages</div>
      </transition-group>
    </div>
  </div>
</template>
<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { onMounted, onUnmounted, ref } from "vue";
import { supabase } from "@/supabase";
import {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import { useLocalStorage } from "@vueuse/core";
import { store } from "@/store";
import { gameStore } from "./gameStore";

import LoadingSpinner from "@/components/LoadingSpinner.vue";
import MessageReply from "@/components/Messages/MessageReply.vue";
import ChatMessage from "@/components/Messages/ChatMessage.vue";
import useToast from "@/components/Toast/useToast";
import { loadProfile } from "@/api/profiles";
import { loadMessages, sendMessageAboutGame } from "@/api/messages";
import { GameMessage, Message } from "@/typings/Message";
import { Profile } from "@/typings/Profile";

/**
 * Note: this and TopicMessages are VERY similar, but there are some
 * small differences. More functionality could undoubtedly
 * be removed and shared, but it feels premature to concern
 * too much about this.
 */

const { showError } = useToast();

const playAudio = useLocalStorage("play-new-message-audio", true);
const alertAudo = new Audio("/notification_simple-02.wav");

const gameId = gameStore.game.id;

const loading = ref(true);

const profilesById = ref<Record<string, Profile>>({});
const messages = ref<Message[]>([]);

let subscription: RealtimeChannel;
onMounted(async () => {
  loading.value = true;
  if (store.user?.id) {
    profilesById.value[store.user.id] = { ...store.user };
  }
  const gameMessages = (await loadMessages(gameId)) as Message[];
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
    }, profilesById.value);
  }
  loading.value = false;
  subscription = supabase
    .channel(`public:messages:topic_id=eq.${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `topic_id=eq.${gameId}`,
      },
      async (payload: RealtimePostgresInsertPayload<Message>) => {
        if (payload.new.from === store.user?.id) return;
        if (!profilesById.value[payload.new.from]) {
          const user = await loadProfile(payload.new.from);
          profilesById.value[user.id] = user;
        }
        messages.value = [payload.new, ...messages.value];
        if (playAudio.value) {
          alertAudo.play();
        }
      }
    )
    .subscribe();
});

onUnmounted(() => {
  supabase.removeChannel(subscription);
});

async function retryMessage({ id, message }: { id: string; message: string }) {
  try {
    const response = await sendMessageAboutGame({
      message,
      group: "all",
      gameId,
    });
    messages.value = messages.value.map((message) => {
      if (message.id === id) {
        return response?.data.message;
      }
      return message;
    });
  } catch (error) {
    showError({ message: "Unable to send message " });
  }
}

async function sendMessage(content: string) {
  try {
    const message = content;
    const response = await sendMessageAboutGame({
      message,
      group: "all",
      gameId,
    });
    messages.value = [response?.data?.message, ...messages.value];
  } catch (error) {
    const tempId = uuidv4();
    const newMessage: GameMessage = {
      id: tempId,
      message: content,
      from: store.user?.id ?? "",
      to: [],
      record_type: "text",
      topic_id: String(gameId),
      topic_type: "game",
      created_at: new Date().toISOString(),
      failedToSend: true,
    };
    messages.value = [newMessage, ...messages.value];
  }
}

function setPlayAudio(val: boolean) {
  playAudio.value = val;
}
</script>
