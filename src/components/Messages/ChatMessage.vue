<template>
  <div
    :id="message.id"
    class="rounded-2xl w-fit p-4"
    :class="[
      message.from === userId
        ? message.failedToSend
          ? 'bg-rose-100 rounded-tr-sm ml-auto'
          : 'bg-sky-200/60 ml-auto rounded-tr-sm'
        : 'bg-gray-200/60 rounded-tl-sm',
    ]"
  >
    <UserBadge
      :username="
        profilesById[message.from].username || profilesById[message.from].email
      "
      :avatar-url="profilesById[message.from].avatar_url"
      :pronouns="profilesById[message.from].pronouns"
      size="small"
    />
    <TipTapDisplay :content="message.message" class="mt-2" />
    <LinkButton
      v-if="message.failedToSend"
      class="text-xs text-slate-600 mt-1"
      @click="retryMessage({ id: message.id, message: message.message })"
    >
      Unable to send. Click to try again.
    </LinkButton>
    <p v-else class="text-xs text-slate-600 mt-1">
      {{ formatRelative(new Date(message.created_at), now) }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from "vue";
import { formatRelative } from "date-fns";

import LinkButton from "@/components/Buttons/LinkButton.vue";
import UserBadge from "@/components/UserBadge.vue";
import TipTapDisplay from "@/components/TipTapDisplay.vue";
import { Profile } from "@/typings/Profile";
import { Message } from "@/typings/Message";

defineProps({
  userId: {
    type: String,
    required: true,
  },
  profilesById: {
    type: Object as PropType<Record<string, Profile>>,
    required: true,
  },
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
});

const emit = defineEmits(["retryMessage"]);

const now = new Date();

function retryMessage(toRetry: { id: string; message: string }) {
  emit("retryMessage", toRetry);
}
</script>
