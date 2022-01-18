<template>
  <article class="grid grid-cols-5">
    <section class="col-span-3">
      <heading level="h6">{{ heading }}</heading>
      <a
        class="hover:underline active:underline text-slate-600 dark:text-slate-400 prose prose-sm"
        :href="website"
      >
        {{ website }}
      </a>
      <p class="prose dark:prose-invert mt-6">
        {{ description }}
      </p>
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
  heading: {
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
});

toRefs(props);
</script>
