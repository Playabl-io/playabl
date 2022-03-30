<template>
  <BaseTemplate>
    <div
      class="h-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-end md:justify-center"
    >
      <div
        class="z-10 bg-white flex flex-col max-w-md p-8 shadow-lg rounded-lg border border-solid border-gray-100"
      >
        <Heading level="h6" as="h6"> That destination doesn't exist </Heading>
        <p class="mt-1">Let's get you back to safety</p>
        <PrimaryButton to="/" class="mt-8"> Take me home </PrimaryButton>
      </div>
      <img
        src="/dragon-404.png"
        alt=""
        width="100%"
        height="100%"
        class="w-full md:w-2/3 object-contain"
      />
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import BaseTemplate from "@/components/BaseTemplate.vue";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
</script>
