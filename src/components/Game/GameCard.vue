<template>
  <router-link
    :to="`/games/${game.id}`"
    class="border border-solid border-gray-300 rounded-lg focus-styles"
  >
    <div
      class="w-full relative"
      :class="{
        'aspect-w-16 aspect-h-9': coverImageUrl,
      }"
    >
      <img
        v-if="coverImageUrl"
        class="w-full h-full object-center object-cover rounded-t-lg"
        :src="coverImageUrl"
        alt="image"
      />
      <div
        :class="{ 'bg-gray-100': !coverImageUrl }"
        class="w-full h-full flex flex-col justify-end rounded-t-lg overflow-auto"
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
    <div class="p-4 rounded-b-lg">
      <Heading as="h6" level="h6">{{ game.title }} </Heading>
      <p class="text-xs text-slate-700 mt-1">{{ game.community_id.name }}</p>
    </div>
  </router-link>
</template>
<script setup lang="ts">
import { PropType, ref, onMounted } from "vue";
import { format } from "date-fns";
import { StarIcon } from "@heroicons/vue/solid";
import { GameListing } from "@/typings/Game";
import Heading from "../Heading.vue";
import Tooltip from "../Tooltip.vue";
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
</script>
