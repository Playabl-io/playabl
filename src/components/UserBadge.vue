<template>
  <div class="flex items-center space-x-4">
    <Avatar :username="username" :avatar-url="avatarUrl" :size="size" />
    <div class="flex flex-col">
      <p
        :class="{
          'text-sm': size === 'small',
        }"
      >
        {{ display }}
      </p>
      <p
        class="text-sm text-slate-700"
        :class="{
          'text-xs': size === 'small',
        }"
      >
        {{ pronouns }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import Avatar from "./Avatar.vue";
const props = defineProps({
  username: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  avatarUrl: {
    type: String,
    default: "",
  },
  pronouns: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "regular",
  },
});

const display = computed(() => {
  return props.username || `${props.email.slice(0, 5)}....`;
});
</script>
