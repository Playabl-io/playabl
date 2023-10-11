<template>
  <Heading level="h6" as="h2" class="mb-2">Cover Image</Heading>
  <FormFileInput
    :current-image="existingImageToUse?.src || communityStore.coverImageUrl"
    :file="newCoverImage"
    size-limit="1 MB"
    @file-change="onFileChange"
    @file-drop="onFileDrop"
    @clear-file="newCoverImage = undefined"
  />
  <LinkButton class="my-2 text-sm" @click="showGallery = true">
    Or select from your media
  </LinkButton>
  <PrimaryButton
    :disabled="!newCoverImage && !existingImageToUse"
    class="w-full mt-2"
    :is-loading="isUpdating"
    @click="updateImage"
  >
    Update
  </PrimaryButton>
  <ImageGalleryModal
    :open="showGallery"
    @close="showGallery = false"
    @select="handleImageSelect"
  />
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
import ImageGalleryModal from "@/components/Modals/ImageGalleryModal.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import { EnhancedFileObject } from "@/typings/Storage";

const { showError, showSuccess } = useToast();

const newCoverImage = ref();
const existingImageToUse = ref<{ image: EnhancedFileObject; src: string }>();
const isUpdating = ref(false);
const showGallery = ref(false);

function onFileDrop(event: DragEvent) {
  const file = handleFileDrop(event, { value: 1000000, label: "1 MB" });
  if (file) {
    existingImageToUse.value = undefined;
    newCoverImage.value = file;
  }
}

function onFileChange(event: Event) {
  const file = handleFileChange(event, { value: 1000000, label: "1 MB" });
  if (file) {
    existingImageToUse.value = undefined;
    newCoverImage.value = file;
  }
}

function handleImageSelect(selection: {
  image: EnhancedFileObject;
  src: string;
}) {
  existingImageToUse.value = selection;
  showGallery.value = false;
}

async function updateImage() {
  if (!store.user?.id) return;
  isUpdating.value = true;

  if (existingImageToUse.value) {
    await supabase
      .from("communities")
      .update({
        cover_image: `${store.user.id}/${existingImageToUse.value.image.name}`,
      })
      .eq("id", communityStore.community.id);
    communityStore.coverImageUrl = existingImageToUse.value.src;
    newCoverImage.value = null;
    existingImageToUse.value = undefined;
    isUpdating.value = false;
    showSuccess({ message: "Cover image updated" });
    return;
  }

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
