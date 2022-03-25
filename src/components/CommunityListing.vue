<template>
  <article class="grid gap-6 w-full max-w-4xl mx-auto">
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
        :alt="`${community.name} cover image`"
        loading="lazy"
      />
      <div
        :class="{
          'bg-gray-100': !coverImageUrl,
          'bg-gradient-to-b from-transparent via-transparent to-black':
            coverImageUrl,
        }"
        class="w-full h-full flex flex-col justify-end rounded-lg p-4"
      >
        <div class="flex gap-4 items-center">
          <router-link
            :to="`/communities/${community.id}`"
            class="hover:underline"
            :class="{
              'text-white': coverImageUrl,
            }"
          >
            <heading level="h5">
              {{ community.name }}
            </heading>
          </router-link>
          <Tooltip v-if="community.code_of_conduct_url">
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
          <Tooltip v-if="community.allow_public_signup">
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
          class="mt-1 hover:underline active:underline text-sm"
          :class="{
            'text-neutral-200': coverImageUrl,
          }"
          :href="community.website"
          target="_blank"
          rel="noreferrer noopener"
        >
          {{ community.website }}
        </a>
      </div>
    </div>

    <section class="flex flex-col">
      <div class="flex flex-wrap gap-4 mt-4">
        <div
          v-for="gameType in community.game_types"
          :key="gameType"
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
          v-if="community.twitter"
          class="underline"
          target="blank"
          :href="`https://twitter.com/${community.twitter}`"
        >
          Twitter
        </a>
        <a
          v-if="community.facebook"
          class="underline"
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
  </article>
</template>
<script setup lang="ts">
import Heading from "./Heading.vue";
import { toRefs, PropType, onMounted, ref } from "vue";
import { BadgeCheckIcon, LightningBoltIcon } from "@heroicons/vue/outline";
import { Community } from "@/typings/Community";
import Tooltip from "./Tooltip.vue";
import { getCoverImageUrl } from "@/api/storage";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});

const coverImageUrl = ref("");

onMounted(async () => {
  if (props.community.cover_image) {
    const publicUrl = await getCoverImageUrl(props.community.cover_image);
    if (publicUrl) {
      coverImageUrl.value = publicUrl;
    }
  }
});

toRefs(props);
</script>
