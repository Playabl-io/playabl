<template>
  <div class="flex flex-col relative">
    <GhostButton
      v-if="file"
      class="absolute right-2 top-2"
      type="button"
      aria-label="Clear file"
      @click="clearFile"
    >
      <TrashIcon class="h-5 w-5" />
    </GhostButton>
    <label
      for="file-input"
      class="w-full p-3 rounded-lg border border-dashed border-gray-400"
      @dragenter.prevent
      @dragover.prevent
      @drop.prevent="emit('fileDrop', $event)"
    >
      <span class="w-full h-full p-3 grid md:grid-cols-2 rounded-md">
        <div class="w-full">
          <div class="aspect-w-16 aspect-h-9 w-full">
            <img
              v-if="imgPreview || currentImage"
              class="w-full object-center object-cover shadow-md rounded-lg"
              :src="imgPreview || currentImage"
              alt="image preview"
            />
            <div
              v-else
              class="w-full h-full rounded-lg bg-gradient-to-tl from-blue-100 to-blue-200"
            />
          </div>
          <p class="text-xs mt-2">Playabl shows images in 16:9 format</p>
        </div>
        <div class="flex flex-col items-center justify-center mt-4 sm:mt-0">
          <button
            type="button"
            class="block text-sm py-2 px-4 rounded-full border-0 font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
            @click="fileInput?.click()"
          >
            Choose a file
          </button>
          <p class="text-slate-700 text-sm my-1">or drop your file here</p>
          <p class="text-sm text-slate-700">{{ sizeLimit }} max file size</p>
        </div>
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
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { TrashIcon } from "@heroicons/vue/24/outline";
import GhostButton from "../Buttons/GhostButton.vue";

const props = defineProps({
  file: {
    type: [File, String],
    default: undefined,
  },
  sizeLimit: {
    type: String,
    default: "1 MB",
  },
  currentImage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["fileDrop", "fileChange", "clearFile"]);

const fileInput = ref<HTMLElement>();

const imgPreview = ref();

const reader = new FileReader();
reader.onload = (event) => {
  imgPreview.value = event.target?.result;
};

watch(
  () => props.file,
  (newFile) => {
    if (newFile) {
      if (typeof newFile === "string") {
        imgPreview.value = newFile;
      } else {
        reader.readAsDataURL(newFile);
      }
    }
  },
);

function clearFile() {
  imgPreview.value = null;
  emit("clearFile");
}
</script>
