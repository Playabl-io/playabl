<template>
  <LoadingSpinner v-if="loading" color="brand-500" class="mx-auto" />
  <section v-else class="flex flex-col gap-1">
    <router-link
      v-for="(group, id) in messagesGroupedByTopicId"
      :key="id"
      class="p-2 text-left mx-1 rounded-md focus-styles hover:bg-gray-100"
      :to="`/games/${id}/messages`"
    >
      <Heading level="h6" as="h6">
        {{ topics[id] }}
      </Heading>
      <p class="mt-2">{{ group.length }} messages</p>
      <p class="text-sm text-slate-700">
        Last message
        {{
          formatRelative(new Date(group[group.length - 1].created_at), today)
        }}
      </p>
    </router-link>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as R from "ramda";
import { formatRelative } from "date-fns";
import Heading from "@/components/Heading.vue";
import { Message } from "@/typings/Message";
import { loadMessagesToUser } from "@/api/messages";
import { store } from "@/store";
import { loadGameIfHasUpcomingSession } from "@/api/gamesAndSessions";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";

const { showError } = useToast();

const loading = ref(true);
const messages = ref<Message[]>([]);
const messagesGroupedByTopicId = ref<Record<string, Message[]>>({});
const topics = ref<Record<string, string>>({});
const today = new Date();

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

    await Promise.all(
      Object.keys(messagesGroupedByTopicId.value).map((id) => {
        return loadGameIfHasUpcomingSession(Number(id)).then((data) => {
          if (data) {
            topics.value[id] = data.title;
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
</script>
