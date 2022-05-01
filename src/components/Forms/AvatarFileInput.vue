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
      <span class="w-full h-full p-3 rounded-md flex justify-center gap-10">
        <img
          v-if="imgPreview || currentImageSrc"
          class="h-20 w-20 rounded-full object-cover"
          :src="imgPreview || currentImageSrc"
          alt="image preview"
        />
        <div v-else class="h-20 w-20 rounded-full bg-green-100" />
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
import { ref, watch, onMounted } from "vue";
import { TrashIcon } from "@heroicons/vue/outline";
import GhostButton from "../Buttons/GhostButton.vue";
import { getAvatarImageUrl } from "@/api/storage";

const props = defineProps({
  file: {
    type: File,
    default: undefined,
  },
  sizeLimit: {
    type: String,
    default: "1 MB",
  },
  currentAvatarPath: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["fileDrop", "fileChange", "clearFile"]);

const fileInput = ref<HTMLElement>();

const imgPreview = ref();
const currentImageSrc = ref();

onMounted(async () => {
  currentImageSrc.value = await getAvatarImageUrl(props.currentAvatarPath);
});

const reader = new FileReader();
reader.onload = (event) => {
  imgPreview.value = event.target?.result;
};

watch(
  () => props.file,
  (newFile) => {
    if (newFile) {
      reader.readAsDataURL(newFile);
    }
  }
);

function clearFile() {
  imgPreview.value = null;
  emit("clearFile");
}
</script>
