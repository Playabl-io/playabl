<template>
  <article class="grid lg:grid-cols-5 gap-6 lg:gap-12">
    <section class="order-2 lg:order-1 lg:col-span-3 flex flex-col">
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
    <section
      class="order-1 lg:order-2 lg:col-span-2 grid place-items-end content-center"
    >
      <div
        class="aspect-w-4 aspect-h-3 lg:aspect-w-16 lg:aspect-h-9 w-full relative"
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
