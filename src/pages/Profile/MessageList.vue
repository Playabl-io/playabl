<template>
  <LoadingSpinner v-if="loading" color="brand-500" class="mx-auto" />
  <section v-else class="grid md:grid-cols-6 gap-4">
    <div class="flex flex-col md:col-span-2">
      <template v-for="(group, id) in messagesGroupedByTopicId" :key="id">
        <router-link
          class="text-left rounded-md p-4 mt-4 first:mt-0 hover:shadow-md"
          :to="`/messages/${id}`"
          active-class="bg-gray-100"
        >
          <Heading level="h6" as="h6">
            {{ topics[id].topic.title }}
          </Heading>
          <p class="mt-2">{{ group.length }} messages</p>
          <p class="text-sm text-slate-700">
            Last message
            {{
              formatRelative(
                new Date(group[group.length - 1].created_at),
                today
              )
            }}
          </p>
        </router-link>
        <div class="py-1 px-4">
          <router-link :to="`/games/${id}`" class="text-sm text-brand-500">
            View game
          </router-link>
        </div>
      </template>
    </div>
    <TopicMessages
      v-if="selectedTopic"
      class="md:col-span-4"
      :topic="selectedTopic"
      @add-message="addMessageToTopic"
      @update-message="updateMessageInTopic"
    />
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import * as R from "ramda";
import { formatRelative } from "date-fns";
import Heading from "@/components/Heading.vue";
import { Message } from "@/typings/Message";
import { loadMessagesToUser } from "@/api/messages";
import { store } from "@/store";
import { loadGame } from "@/api/gamesAndSessions";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import { Game } from "@/typings/Game";
import TopicMessages from "./TopicMessages.vue";

const { showError } = useToast();
const route = useRoute();

const routeTopicId = ref(route.params.topic_id);

watch(
  () => route.params,
  (newValue) => {
    routeTopicId.value = newValue.topic_id;
  }
);

const loading = ref(true);
const messages = ref<Message[]>([]);
const messagesGroupedByTopicId = ref<Record<string, Message[]>>({});
const topics = ref<
  Record<
    string,
    { id: string | number; topicType: "game"; topic: Game; messages: Message[] }
  >
>({});
const today = new Date();

const selectedTopic = computed(() => {
  if (routeTopicId.value && typeof routeTopicId.value === "string") {
    return topics.value[routeTopicId.value];
  }
  return undefined;
});

onMounted(async () => {
  if (!store.user?.id) return;
  try {
    const data = await loadMessagesToUser(store.user.id);
    if (data) {
      messages.value = data;
    }

    messagesGroupedByTopicId.value = R.groupBy(
      (message: Message) => message.topic_id
    )(messages.value);

    const gameIds = messages.value.reduce((acc, message) => {
      if (message.topic_type === "game") {
        acc.push(message.topic_id);
      }
      return acc;
    }, [] as string[]);

    const uniqueGameIds = [...new Set(gameIds)];

    await Promise.all(
      uniqueGameIds.map((id) => {
        return loadGame(Number(id)).then((data) => {
          if (data) {
            topics.value[id] = {
              id,
              topicType: "game",
              topic: data,
              messages: messagesGroupedByTopicId.value[id],
            };
          }
        });
      })
    );
  } catch (error) {
    showError({ message: "Unable to load messages" });
    log({ error });
  } finally {
    loading.value = false;
  }
});

function addMessageToTopic({
  topicId,
  message,
}: {
  topicId: string;
  message: Message;
}) {
  topics.value[topicId].messages.unshift(message);
}

function updateMessageInTopic({
  topicId,
  message,
  id,
}: {
  topicId: string;
  message: Message;
  id: string;
}) {
  topics.value[topicId].messages = topics.value[topicId].messages.map((cur) => {
    if (cur.id === id) {
      return message;
    }
    return cur;
  });
}
</script>
