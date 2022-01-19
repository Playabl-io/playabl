<template>
  <article class="grid grid-cols-5">
    <section class="col-span-3 flex flex-col">
      <router-link :to="`/communities/${id}`" class="hover:underline">
        <heading level="h6">{{ name }}</heading>
      </router-link>
      <a
        class="mt-1 hover:underline active:underline text-slate-600 dark:text-slate-400 text-sm"
        :href="website"
      >
        {{ website }}
      </a>
      <p class="prose dark:prose-invert my-6 whitespace-pre-wrap">
        {{ description }}
      </p>
      <div
        class="mt-auto text-xs text-slate-600 dark:text-slate-400 flex space-x-4"
      >
        <a
          class="underline"
          v-if="twitter"
          target="blank"
          :href="`https://twitter.com/${twitter}`"
        >
          Twitter
        </a>
        <a
          class="underline"
          v-if="facebook"
          target="blank"
          :href="`https://facebook.com/${facebook}`"
        >
          Facebook
        </a>
      </div>
    </section>
    <section class="col-span-2 grid place-items-end content-center">
      <div class="bg-gray-200 rounded-md aspect-1 h-40"></div>
    </section>
  </article>
</template>
<script setup lang="ts">
import Heading from "./Heading.vue";
import { toRefs } from "vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  twitter: {
    type: String,
    default: "",
  },
  facebook: {
    type: String,
    default: "",
  },
});

toRefs(props);
</script>
