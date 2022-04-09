<template>
  <section class="grid gap-6 w-full max-w-4xl mx-auto">
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
      <div
        class="w-full relative"
        :class="{
          'aspect-w-16 aspect-h-9': coverImageUrl,
        }"
      >
        <img
          v-if="coverImageUrl"
          class="w-full h-full object-center object-cover shadow-md rounded-lg"
          :src="coverImageUrl"
          alt=""
          loading="lazy"
        />
        <div
          :class="{
            'bg-gray-100': !coverImageUrl,
          }"
          class="w-full h-full flex flex-col justify-end rounded-lg"
        >
          <div class="flex flex-wrap gap-6 px-6 py-4">
            <div
              v-for="session in game.sessions"
              :key="session.id"
              class="p-2 rounded-md flex items-center space-x-1 shadow-sm"
              :class="[session.has_openings ? 'bg-green-200' : 'bg-gray-200']"
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
        </div>
      </div>
      <div class="flex flex-wrap gap-4">
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
        <GameBadge
          title="Safety tools"
          :value="`${game.uses_safety_tools ? 'Yes' : 'No'}`"
        >
          <template #icon>
            <SupportIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
      </div>
    </div>
    <div class="bg-gray-200 bg-opacity-70 rounded-lg p-2">
      <QuillEditor
        theme="bubble"
        :content="JSON.parse(game.description)"
        read-only
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { toRefs, PropType, ref, onMounted } from "vue";
import { format } from "date-fns";
import {
  TagIcon,
  CogIcon,
  UsersIcon,
  FilmIcon,
  SupportIcon,
} from "@heroicons/vue/outline";
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
