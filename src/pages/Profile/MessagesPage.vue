<template>
  <ProfileTemplate>
    <p class="font-bold mb-6">
      Messages will be removed soon. Based on user feedback, in app messaging
      will be deprecated in favor of showing player emails to game managers and
      community admins.
    </p>
    <MessageList />
  </ProfileTemplate>
</template>
<script setup lang="ts">
import ProfileTemplate from "@/components/ProfileTemplate.vue";
import MessageList from "./MessageList.vue";
</script>
