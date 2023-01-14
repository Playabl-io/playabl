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
      <router-link :to="`/games/${game.id}`" :aria-label="`View ${game.title}`">
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
                v-if="isSmall"
                class="p-2 rounded-md flex items-center space-x-1 shadow-sm"
                :class="[
                  game.sessions.some((session) => session.has_openings)
                    ? 'bg-green-200'
                    : 'bg-gray-200',
                ]"
              >
                {{ game.sessions.length }}
                {{
                  pluralize({
                    count: game.sessions.length,
                    singular: "session",
                  })
                }}
                starting
                {{ format(new Date(game.sessions[0].start_time), "LLL do") }}
              </div>
              <template
                v-for="session in game.sessions"
                v-else
                :key="session.id"
              >
                <Tooltip v-if="session.has_openings">
                  <template #tooltip> Seats available </template>
                  <template #trigger="{ toggleTooltip }">
                    <div
                      class="p-2 rounded-md flex items-center space-x-1 shadow-sm"
                      :class="[
                        session.has_openings ? 'bg-green-200' : 'bg-gray-200',
                      ]"
                      @mouseenter="toggleTooltip"
                      @mouseleave="toggleTooltip"
                      @focus="toggleTooltip"
                      @blur="toggleTooltip"
                    >
                      <p class="text-sm font-semibold">
                        {{ format(new Date(session.start_time), "LLL do") }}
                      </p>
                      <StarIcon class="h-4 w-4 text-emerald-600" />
                    </div>
                  </template>
                </Tooltip>
              </template>
            </div>
          </div>
        </div>
      </router-link>
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
            <LifebuoyIcon class="w-6 h-6 mr-4" />
          </template>
        </GameBadge>
      </div>
    </div>
    <div class="bg-gray-200 bg-opacity-70 rounded-lg p-4">
      <TipTapDisplay :content="game.description" />
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
  LifebuoyIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon } from "@heroicons/vue/20/solid";
import Heading from "./Heading.vue";
import { GameListing } from "@/typings/Game";
import Tooltip from "./Tooltip.vue";
import GameBadge from "./Game/GameBadge.vue";
import { getCoverImageUrl } from "@/api/storage";
import TipTapDisplay from "./TipTapDisplay.vue";

import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { pluralize } from "@/util/grammar";
const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmall = breakpoints.smaller("md");

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
