<template>
  <div
    class="absolute flex flex-col space-y-4 top-6 right-2 sm:top-6 sm:right-12"
  >
    <transition-group
      enter-active-class="transform-gpu duration-300 ease-out"
      leave-active-class="absolute transform-gpu duration-200"
      enter-from-class="opacity-0 scale-70"
      leave-to-class="opacity-0 scale-70"
      enter-to-class="opacity-1 scale-100"
      leave-from-class="opacity-1 scale-100"
      move-class="transform-gpu duration-300 ease-in"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        role="alert"
        class="block shadow-xl rounded-lg w-72 sm:w-96 p-4 z-50"
        :class="{
          'bg-sky-100 dark:bg-sky-700': message.type === 'success',
          'bg-rose-200 dark:bg-rose-700': message.type === 'error',
        }"
        @mouseover="pauseTimer(message.id)"
        @mouseout="resetAndStartTimer(message.id)"
      >
        <div class="relative flex justify-between">
          <div class="flex flex-col">
            <Heading v-if="message.title" level="h6" as="h6" class="mb-1">
              {{ message.title }}
            </Heading>
            <p>{{ message.message }}</p>
            <a
              v-if="message.link"
              :href="message.link.href"
              target="_blank"
              rel="no-referrer"
              class="underline mt-2 text-sm font-semibold"
            >
              {{ message.link.label }}
            </a>
          </div>
          <dismiss-button
            class="absolute right-0 top-0 rounded-full"
            label="Dismiss notification"
            @click="clearMessage(message.id)"
          />
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import useToast from "./useToast";
import DismissButton from "../Buttons/DismissButton.vue";
import Heading from "../Heading.vue";

const { messages, clearMessage, pauseTimer, resetAndStartTimer } = useToast();
</script>
