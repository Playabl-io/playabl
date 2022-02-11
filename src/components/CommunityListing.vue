<template>
  <article class="grid md:grid-cols-5 gap-6 md:gap-12">
    <section class="order-2 md:order-1 md:col-span-3 flex flex-col">
      <div class="flex space-x-4 items-end">
        <router-link
          :to="`/communities/${community.id}`"
          class="hover:underline"
        >
          <heading level="h6">{{ community.name }}</heading>
        </router-link>
        <Tooltip>
          <template #trigger="{ toggleTooltip }">
            <BadgeCheckIcon
              v-if="community.code_of_conduct_url"
              class="text-green-500 h-6 w-6 relative"
              @mouseenter="toggleTooltip"
              @mouseleave="toggleTooltip"
              @focus="toggleTooltip"
              @blur="toggleTooltip"
            />
          </template>
          <template #tooltip> Has a community code of conduct </template>
        </Tooltip>
        <Tooltip>
          <template #trigger="{ toggleTooltip }">
            <LightningBoltIcon
              v-if="community.allow_public_signup"
              class="text-yellow-500 h-6 w-6"
              @mouseenter="toggleTooltip"
              @mouseleave="toggleTooltip"
              @focus="toggleTooltip"
              @blur="toggleTooltip"
            />
          </template>
          <template #tooltip> This community allows public joining </template>
        </Tooltip>
      </div>
      <a
        class="mt-1 hover:underline active:underline text-slate-600 dark:text-slate-400 text-sm"
        :href="community.website"
      >
        {{ community.website }}
      </a>
      <div class="flex flex-wrap gap-4 mt-4">
        <div
          :key="gameType"
          v-for="gameType in community.game_types"
          class="rounded-xl px-2 bg-blue-500 text-white"
        >
          {{ gameType }}
        </div>
      </div>
      <p class="prose dark:prose-invert my-6 whitespace-pre-wrap">
        {{ community.description }}
      </p>

      <div
        class="mt-auto text-xs text-slate-600 dark:text-slate-400 flex space-x-4"
      >
        <a
          class="underline"
          v-if="community.twitter"
          target="blank"
          :href="`https://twitter.com/${community.twitter}`"
        >
          Twitter
        </a>
        <a
          class="underline"
          v-if="community.facebook"
          target="blank"
          :href="`https://facebook.com/${community.facebook}`"
        >
          Facebook
        </a>
        <a
          v-if="community.discord"
          class="underline"
          target="blank"
          :href="community.discord"
        >
          Discord
        </a>
        <a
          v-if="community.slack"
          class="underline"
          target="blank"
          :href="community.slack"
        >
          Slack
        </a>
      </div>
    </section>
    <section
      class="order-1 md:order-2 md:col-span-2 grid place-items-end content-center"
    >
      <div
        class="aspect-w-16 aspect-h-9 md:aspect-w-4 md:aspect-h-3 w-full relative"
      >
        <img
          v-if="coverImageUrl"
          class="w-full h-full object-center object-cover shadow-md rounded-lg"
          :src="coverImageUrl"
          alt="image"
        />
      </div>
    </section>
  </article>
</template>
<script setup lang="ts">
import Heading from "./Heading.vue";
import { toRefs, PropType, onMounted, ref } from "vue";
import { BadgeCheckIcon, LightningBoltIcon } from "@heroicons/vue/outline";
import { Community } from "@/typings/Community";
import { supabase } from "@/supabase";
import Tooltip from "./Tooltip.vue";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});

const isLoadingImage = ref(true);
const coverImageUrl = ref("");

onMounted(() => {
  if (props.community.cover_image) {
    getCoverImageUrl(props.community.cover_image);
  }
});

const getCoverImageUrl = async (path: string) => {
  const { publicURL } = await supabase.storage
    .from("cover-images")
    .getPublicUrl(path);
  coverImageUrl.value = publicURL ?? "";
};

toRefs(props);
</script>
