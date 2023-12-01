<template>
  <section class="full-width bg-gradient-to-br from-blue-700 to-blue-900 py-12">
    <div class="p-4 md:container md:mx-auto max-w-6xl">
      <Heading id="find-your-next-game" as="h4" level="h4" class="text-white">
        Ready for another game?
      </Heading>
      <p class="text-sm mt-2 mb-4 text-white">
        Sessions with openings in the next seven days
      </p>
      <div
        class="py-8 min-h-[212px] flex gap-6 overflow-auto snap-x snap-mandatory rounded-md"
      >
        <div
          v-for="game in db.games"
          :key="game.id"
          class="snap-center flex-none w-[280px] md:w-[400px]"
        >
          <MiniGameItem
            :session="game"
            :all-game-sessions="game.game_id.sessions"
          />
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { PropType } from "vue";
import Heading from "@/components/Heading.vue";
import MiniGameItem from "../Community/MiniGameItem.vue";
import { dashboard } from "../IndexPage.vue";

defineProps({
  db: {
    type: Object as PropType<dashboard>,
    required: true,
  },
});
</script>
