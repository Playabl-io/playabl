<template>
  <div
    v-if="!online"
    class="absolute inset-x-0 mx-auto w-fit rounded-xl bottom-6 p-4 bg-black text-neutral-50 flex items-center gap-3"
  >
    <SignalSlashIcon class="w-6 h-6" />
    <p class="sm:text-sm">You are currently offline</p>
  </div>
</template>
<script setup lang="ts">
import { useOnline } from "@vueuse/core";
import { SignalSlashIcon } from "@heroicons/vue/24/outline";
const online = useOnline();
</script>
