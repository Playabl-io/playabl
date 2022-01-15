<template>
  <article class="grid grid-cols-5">
    <section class="col-span-3">
      <heading level="h6">{{ heading }}</heading>
      <slot name="website"></slot>
      <p class="prose mt-6">
        <slot name="description"></slot>
      </p>
    </section>
    <section class="col-span-2 grid place-items-center content-center">
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
});

toRefs(props);
</script>
