<template>
  <div class="flex flex-col">
    <router-link
      :to="`/games/${session.game_id.id}`"
      class="text-xl font-paytone line-clamp-2"
      >{{ session.game_id.title }}
    </router-link>
    <router-link
      :to="`/communities/${
        session.game_id.community_id?.url_short_name ||
        session.game_id.community_id?.id
      }`"
      class="text-sm text-brand-500 mt-1"
    >
      {{ session.game_id.community_id?.name }}
    </router-link>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from "vue";
import { sessionWithGame } from "../IndexPage.vue";

defineProps({
  session: {
    type: Object as PropType<sessionWithGame>,
    required: true,
  },
});
</script>
