<template>
  <div class="p-4 bg-white border border-gray-300 rounded-md">
    <Heading as="h6" level="h6" class="mb-2">{{ title }}</Heading>
    <p class="text-sm">
      {{ subTitle }}
    </p>
    <div class="grid sm:grid-cols-3 md:grid-cols-5 gap-8 mt-6">
      <img
        v-if="isSmAndLarger"
        class="md:col-span-2 sm:w-full md:w-3/5 lg:w-full bg-cover mx-auto"
        :src="imgPath"
        alt=""
        width="100%"
      />
      <div
        class="sm:col-span-2 md:col-span-3 p-2 flex flex-col gap-3 justify-center items-end"
      >
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-brand-500 hover:underline focuse:underline text-right lg:text-sm"
          :target="link.external ? '__blank' : ''"
          rel="noreferrer noopener"
          >{{ link.label }}</a
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import Heading from "../../components/Heading.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

defineProps({
  title: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: true,
  },
  imgPath: {
    type: String,
    required: true,
  },
  links: {
    type: Array as PropType<
      { href: string; label: string; external?: boolean }[]
    >,
    required: true,
  },
});
</script>
