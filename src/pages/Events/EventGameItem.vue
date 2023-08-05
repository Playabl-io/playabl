<template>
  <router-link :to="`/games/${game.id}`">
    <div class="rounded-md bg-white w-96">
      <div v-if="gameCoverImage" class="aspect-w-16 aspect-h-9">
        <img
          class="w-full h-full object-center object-cover rounded-t-md"
          :src="gameCoverImage"
          alt=""
        />
      </div>
      <div class="px-4 pt-2 pb-4">
        <div class="flex gap-2 items-start justify-between">
          <div>
            <Heading level="h6">
              {{ game.title }}
            </Heading>
            <p class="text-sm text-slate-700">
              {{ game.system }}
            </p>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-3">
          <ColorTag variant="blue">
            {{
              `${game.sessions.length} ${pluralize({
                count: game.sessions.length,
                singular: "session",
              })}`
            }}
          </ColorTag>
          <ColorTag v-if="hasOpenings" variant="blue"> Spots open </ColorTag>
        </div>
        <p class="text-sm line-clamp-3 mt-2 text-slate-700">
          {{ game.description_as_flat_text }}
        </p>
      </div>
    </div>
  </router-link>
</template>
<script lang="ts" setup>
import { PropType, computed } from "vue";
import Heading from "@/components/Heading.vue";
import { Game } from "@/typings/Game";
import ColorTag from "@/components/ColorTag.vue";
import { Session } from "@/typings/Session";
import { pluralize } from "@/util/grammar";
import useSWRV from "swrv";
import { getCoverImageUrl } from "@/api/storage";

const props = defineProps({
  game: {
    type: Object as PropType<Game & { sessions: Session[] }>,
    required: true,
  },
});

const hasOpenings = computed(() => {
  return props.game.sessions.some((session) => {
    return session.participant_count > session.rsvps.length;
  });
});

const { data: gameCoverImage } = useSWRV(
  props.game.cover_image,
  getCoverImageUrl
);
</script>
