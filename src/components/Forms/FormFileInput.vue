<template>
  <label
    for="file-input"
    class="h-40 w-full p-3 rounded-lg bg-gray-200 bg-opacity-70"
    @dragenter.prevent
    @dragover.prevent
    @drop.prevent="emit('fileDrop', $event)"
  >
    <span
      class="w-full h-full p-3 grid place-items-center border border-dashed border-gray-400 rounded-md"
    >
      <template v-if="file">
        <p class="truncate">
          {{ file.name }}
        </p>
        <GhostButton type="button" @click="emit('clearFile')">
          Clear
        </GhostButton>
      </template>
      <template v-else>
        <PrimaryButton type="button" @click="fileInput?.click()">
          Choose a file
        </PrimaryButton>
        <p>or drop your file here</p>
        <p class="text-sm text-slate-700">{{ sizeLimit }} max file size</p>
      </template>
    </span>
    <input
      id="file-input"
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="emit('fileChange', $event)"
    />
  </label>
</template>
<script setup lang="ts">
import GhostButton from "../Buttons/GhostButton.vue";
import PrimaryButton from "../Buttons/PrimaryButton.vue";
import { ref } from "vue";

defineProps({
  file: {
    type: File,
    default: undefined,
  },
  sizeLimit: {
    type: String,
    default: "3 MB",
  },
});

const emit = defineEmits(["fileDrop", "fileChange", "clearFile"]);

const fileInput = ref<HTMLElement>();
</script>
