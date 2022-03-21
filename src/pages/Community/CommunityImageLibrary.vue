<template>
  <Heading level="h6" as="h2" class="mb-2">Cover Image</Heading>
  <FormFileInput
    :current-image="communityStore.coverImageUrl"
    :file="newCoverImage"
    size-limit="3 MB"
    @file-change="onFileChange"
    @file-drop="onFileDrop"
    @clear-file="newCoverImage = undefined"
  />
  <PrimaryButton
    :disabled="!newCoverImage"
    class="w-full mt-2"
    :is-loading="isUpdating"
    @click="updateImage"
  >
    Update
  </PrimaryButton>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Heading from "@/components/Heading.vue";
import FormFileInput from "@/components/Forms/FormFileInput.vue";
import {
  handleFileChange,
  handleFileDrop,
} from "@/components/Forms/fileInputUtil";
import { communityStore } from "./communityStore";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { store } from "@/store";
import { getCoverImageUrl, uploadToCoverImageStorage } from "@/api/storage";
import { supabase } from "@/supabase";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";

const { showError, showSuccess } = useToast();

const newCoverImage = ref();
const isUpdating = ref(false);

function onFileDrop(event: DragEvent) {
  const file = handleFileDrop(event, { value: 3000000, label: "3 MB" });
  if (file) {
    newCoverImage.value = file;
  }
}

function onFileChange(event: Event) {
  const file = handleFileChange(event, { value: 3000000, label: "3 MB" });
  if (file) {
    newCoverImage.value = file;
  }
}

async function updateImage() {
  if (!store.user?.id) return;
  isUpdating.value = true;
  try {
    const imagePath = await uploadToCoverImageStorage({
      file: newCoverImage.value,
      id: store.user.id,
    });
    if (!imagePath) {
      throw new Error("Unable to upload cover image");
    }
    await supabase
      .from("communities")
      .update({
        cover_image: imagePath,
      })
      .eq("id", communityStore.community.id);
    const publicUrl = await getCoverImageUrl(imagePath);
    communityStore.coverImageUrl = publicUrl;
    newCoverImage.value = null;
    showSuccess({ message: "Cover image updated" });
  } catch (error) {
    showError({ message: "Unable to update cover image" });
    log({ error });
  } finally {
    isUpdating.value = false;
  }
}
</script>
