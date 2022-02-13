<template>
  <article class="grid gap-6">
    <section class="flex flex-col">
      <div class="grid heading-grid gap-6">
        <div>
          <router-link :to="`/games/${game.id}`" class="hover:underline">
            <heading level="h6">{{ game.title }}</heading>
          </router-link>
          <router-link
            class="mt-1 hover:underline active:underline text-slate-600 dark:text-slate-400 text-sm"
            :to="`/communities/${game.community_id.id}`"
          >
            {{ game.community_id.name }}
          </router-link>
        </div>
        <div class="lg:place-self-end flex flex-wrap gap-4">
          <GameBadge v-if="game.system" title="System" :value="game.system">
            <template #icon>
              <TagIcon class="w-6 h-6 mr-4" />
            </template>
          </GameBadge>
          <GameBadge
            v-if="game.virtual_tabletop"
            title="VTT"
            :value="game.virtual_tabletop"
          >
            <template #icon>
              <CogIcon class="w-6 h-6 mr-4" />
            </template>
          </GameBadge>
          <GameBadge title="Players" :value="game.participant_count || 0">
            <template #icon>
              <UsersIcon class="w-6 h-6 mr-4" />
            </template>
          </GameBadge>
          <GameBadge
            title="Recorded"
            :value="`${game.will_be_recorded ? 'Yes' : 'No'}`"
          >
            <template #icon>
              <FilmIcon class="w-6 h-6 mr-4" />
            </template>
          </GameBadge>
        </div>
      </div>
      <div class="bg-gray-200 bg-opacity-70 rounded-lg p-2 my-6">
        <QuillEditor
          theme="bubble"
          :content="JSON.parse(game.description)"
          read-only
        />
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <div
          v-for="session in game.sessions"
          :key="session.id"
          class="p-2 rounded-md flex items-center space-x-1"
          :class="[
            session.has_openings ? 'bg-green-200' : 'bg-gray-200 bg-opacity-70',
          ]"
        >
          <p class="text-sm font-semibold">
            {{ format(new Date(session.start_time), "LLL do") }}
          </p>
          <Tooltip v-if="session.has_openings">
            <template #tooltip>Seats available</template>
            <template #trigger="{ toggleTooltip }">
              <StarIcon
                class="h-4 w-4 text-emerald-600"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
          </Tooltip>
        </div>
      </div>
    </section>
    <section v-if="coverImageUrl">
      <div class="aspect-w-4 aspect-h-3 lg:aspect-w-16 lg:aspect-h-9 w-full">
        <img
          class="object-center object-cover shadow-md rounded-lg"
          :src="coverImageUrl"
          alt="image"
        />
      </div>
    </section>
  </article>
</template>
<script setup lang="ts">
import { toRefs, PropType, ref, onMounted } from "vue";
import { format } from "date-fns";
import { TagIcon, CogIcon, UsersIcon, FilmIcon } from "@heroicons/vue/outline";
import { StarIcon } from "@heroicons/vue/solid";
import Heading from "./Heading.vue";
import { GameListing } from "@/typings/Game";
import Tooltip from "./Tooltip.vue";
import GameBadge from "./Game/GameBadge.vue";
import { getCoverImageUrl } from "@/api/storage";

const props = defineProps({
  game: {
    type: Object as PropType<GameListing>,
    required: true,
  },
});

const coverImageUrl = ref("");

onMounted(async () => {
  if (props.game.cover_image) {
    coverImageUrl.value = await getCoverImageUrl(props.game.cover_image);
  }
});

toRefs(props);
</script>
<style scoped>
@media screen(lg) {
  .heading-grid {
    grid-template-columns: auto 1fr;
  }
}
</style>
