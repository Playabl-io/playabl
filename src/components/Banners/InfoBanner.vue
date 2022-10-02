<template>
  <div class="rounded-md flex p-4 bg-blue-300 text-slate-800">
    <InformationCircleIcon class="w-6 h-6 mr-4" />
    <slot></slot>
    <DismissButton
      label="Dismiss"
      class="ml-auto text-slate-700"
      @click="emit('dismiss')"
    />
  </div>
</template>
<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import DismissButton from "../Buttons/DismissButton.vue";
const emit = defineEmits(["dismiss"]);
</script>
