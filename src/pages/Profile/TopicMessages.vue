<template>
  <div class="bg-gray-100 rounded-lg flex flex-col p-4">
    <MessageReply
      :play-audio="playAudio"
      @send-message="sendMessage"
      @update-play-audio="setPlayAudio"
    />
    <div class="mt-6 grid gap-6 items-start rounded-lg relative">
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
        <template v-else-if="topic.messages.length > 0">
          <ChatMessage
            v-for="message in topic.messages"
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
import { onBeforeMount, onUnmounted, PropType, ref, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { loadProfile } from "@/api/profiles";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import MessageReply from "@/components/Messages/MessageReply.vue";
import { GameMessage, Message } from "@/typings/Message";
import { store } from "@/store";
import { sendMessageAboutGame } from "@/api/messages";
import { supabase } from "@/supabase";
import { RealtimeSubscription } from "@supabase/supabase-js";
import useToast from "@/components/Toast/useToast";
import { Profile } from "@/typings/Profile";
import { Game } from "@/typings/Game";
import ChatMessage from "@/components/Messages/ChatMessage.vue";

/**
 * Note: this and GameMessages are VERY similar, but there are some
 * small differences. More functionality could undoubtedly
 * be removed and shared, but it feels premature to concern
 * too much about this.
 */

const props = defineProps({
  topic: {
    type: Object as PropType<{
      id: string | number;
      topicType: "game";
      topic: Game;
      messages: Message[];
    }>,
    required: true,
  },
});

const emit = defineEmits(["addMessage", "updateMessage"]);

const { showError } = useToast();

const playAudio = useLocalStorage("play-new-message-audio", true);
const alertAudo = new Audio("/notification_simple-02.wav");

const loading = ref(true);

const profilesById = ref<Record<string, Profile>>({});

watch(
  () => props.topic,
  (newTopic) => setup(newTopic)
);

let subscription: RealtimeSubscription;
onBeforeMount(() => setup(props.topic));

onUnmounted(() => {
  supabase.removeSubscription(subscription);
});

async function setup(topic: {
  id: string | number;
  topicType: "game";
  topic: Game;
  messages: Message[];
}) {
  loading.value = true;
  if (store.user?.id) {
    profilesById.value[store.user.id] = { ...store.user };
  }
  if (subscription) {
    subscription.unsubscribe();
  }
  if (topic.messages) {
    const messageUsers = topic.messages.reduce((acc, cur) => {
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
    .from(`messages:topic_id=eq.${topic.id}`)
    .on("INSERT", async (payload) => {
      if (payload.new.from === store.user?.id) return;
      if (!profilesById.value[payload.new.from]) {
        const user = await loadProfile(payload.new.from);
        profilesById.value[user.id] = user;
      }
      emit("addMessage", { message: payload.new, topicId: topic.id });
      if (playAudio.value) {
        alertAudo.play();
      }
    })
    .subscribe();
}

async function retryMessage({ id, message }: { id: string; message: string }) {
  try {
    const response = await sendMessageAboutGame({
      message,
      group: "all",
      gameId: Number(props.topic.id),
    });
    emit("updateMessage", {
      id,
      message: response?.data.message,
      topicId: props.topic.id,
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
      gameId: Number(props.topic.id),
    });
    emit("addMessage", {
      message: response?.data.message,
      topicId: props.topic.id,
    });
  } catch (error) {
    const tempId = uuidv4();
    const newMessage: GameMessage = {
      id: tempId,
      message: content,
      from: store.user?.id ?? "",
      to: [],
      record_type: "text",
      topic_id: String(props.topic.id),
      topic_type: "game",
      created_at: new Date().toISOString(),
      failedToSend: true,
    };
    emit("addMessage", {
      message: newMessage,
      topicId: props.topic.id,
    });
  }
}

function setPlayAudio(val: boolean) {
  playAudio.value = val;
}
</script>
