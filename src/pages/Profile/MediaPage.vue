<template>
  <ProfileTemplate>
    <div v-if="loading" class="grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <section v-else>
      <p>{{ usedSpaceInMb }} MB used</p>
      <Heading as="h3" level="h6" class="mb-6">Avatar</Heading>
      <div>
        <AvatarFileInput
          :file="newAvatar"
          :current-avatar-path="currentAvatarPath"
          size-limit="1 MB"
          @file-change="onFileChange"
          @file-drop="onFileDrop"
          @clear-file="newAvatar = undefined"
        />
        <PrimaryButton
          v-if="newAvatar"
          class="w-full mt-2"
          :is-loading="updatingAvatar"
          @click="setUserAvatar"
        >
          Update avatar
        </PrimaryButton>
      </div>
      <Heading as="h3" level="h6" class="mt-10 mb-4"> Cover Images </Heading>
      <div class="flex justify-between mb-6">
        <p class="text-sm text-slate-700">
          Warning, removing an image will break the link if it is currently in
          use on any games or communities.
        </p>
        <OutlineButton
          :disabled="selectedCoverImages.length === 0"
          :is-loading="removingImages"
          @click="removeCoverImages"
        >
          <TrashIcon class="w-6 h-6 text-slate-700 mr-1" />
          Remove
        </OutlineButton>
      </div>
      <fieldset
        :disabled="removingImages"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative"
      >
        <ManagedImage
          v-for="image in coverImages"
          :key="image.id"
          :image="image"
          :selected="selectedCoverImages.some((cur) => cur.id === image.id)"
          @select="handleSelect"
        />
        <div
          v-if="removingImages"
          class="w-full h-full z-10 absolute bg-gray-100 bg-opacity-50 grid place-content-center"
        >
          <LoadingSpinner color="brand-500" />
        </div>
      </fieldset>
    </section>
  </ProfileTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { supabase } from "@/supabase";
import ProfileTemplate from "@/components/ProfileTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { store } from "@/store";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import Heading from "@/components/Heading.vue";
import AvatarFileInput from "@/components/Forms/AvatarFileInput.vue";
import ManagedImage from "./ManagedImage.vue";
import { bytesToMb, sum } from "@/util/math";
import {
  handleFileChange,
  handleFileDrop,
} from "@/components/Forms/fileInputUtil";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { removeObjects, uploadToAvatarStorage } from "@/api/storage";
import useToast from "@/components/Toast/useToast";
import { updateProfile } from "@/api/profiles";
import { TrashIcon } from "@heroicons/vue/24/outline";
import { EnhancedFileObject } from "@/typings/Storage";

const { showSuccess, showError } = useToast();

const loading = ref(true);
const coverImages = ref<EnhancedFileObject[]>([]);
const avatars = ref<EnhancedFileObject[]>([]);
const selectedCoverImages = ref<EnhancedFileObject[]>([]);
const removingImages = ref(false);
const newAvatar = ref<File>();
const updatingAvatar = ref(false);

// We only allow setting a single avatar, so there should be only one file
const currentAvatar = computed(() => avatars.value[0]);
const currentAvatarPath = computed(() => {
  if (!currentAvatar.value) return undefined;
  return `${store.user?.id}/${currentAvatar.value.name}`;
});

const usedSpaceInMb = computed(() => {
  const sumOfCoverImages = coverImages.value
    .map((image) => image.metadata.size)
    .reduce(sum, 0);
  const sumOfAvatars = avatars.value
    .map((image) => image.metadata.size)
    .reduce(sum, 0);
  const mb = bytesToMb(sum(sumOfCoverImages, sumOfAvatars));
  return mb.toFixed(2);
});

onMounted(() => {
  Promise.all([getUserAvatars(), getUserCoverImages()]).then(
    () => (loading.value = false)
  );
});

function handleSelect({
  image,
  checked,
}: {
  image: EnhancedFileObject;
  checked: boolean;
}) {
  if (checked) {
    selectedCoverImages.value = selectedCoverImages.value.concat(image);
  } else {
    selectedCoverImages.value = selectedCoverImages.value.filter(
      (cur) => cur.id !== image.id
    );
  }
}

async function getUserCoverImages() {
  if (!store.user?.id) return;
  const { data } = await supabase.storage
    .from("cover-images")
    .list(store.user.id, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  if (data) {
    coverImages.value = data as EnhancedFileObject[];
  }
}

async function getUserAvatars() {
  if (!store.user?.id) return;
  const { data } = await supabase.storage.from("avatars").list(store.user.id, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });
  if (data) {
    avatars.value = data as EnhancedFileObject[];
  }
}

async function setUserAvatar() {
  if (!newAvatar.value || !store.user) return;
  updatingAvatar.value = true;
  const promises = [];
  if (currentAvatarPath.value) {
    promises.push(
      removeObjects({ bucket: "avatars", paths: [currentAvatarPath.value] })
    );
  }
  promises.push(uploadToAvatarStorage(newAvatar.value));
  promises.push(
    updateProfile({
      userId: store.user.id,
      update: {
        avatar_url: `${store.user.id}/${newAvatar.value.name}`,
      },
    })
  );
  try {
    await Promise.all(promises);
    getUserAvatars();
    store.user.avatar_url = `${store.user.id}/${newAvatar.value.name}`;
    newAvatar.value = undefined;
    showSuccess({ message: "Avatar updated" });
  } catch (error) {
    showError({ message: "Unable to change avatar" });
  } finally {
    updatingAvatar.value = false;
  }
}

async function removeCoverImages() {
  if (!store.user?.id) return;
  try {
    removingImages.value = true;
    await removeObjects({
      bucket: "cover-images",
      paths: selectedCoverImages.value.map(
        (image) => `${store.user?.id}/${image.name}`
      ),
    });
    showSuccess({ message: "Cover images removed" });
    selectedCoverImages.value = [];
    getUserCoverImages();
  } catch (error) {
    showError({ message: "Unable to remove cover images" });
  } finally {
    removingImages.value = false;
  }
}

function onFileDrop(event: DragEvent) {
  const file = handleFileDrop(event, { value: 1000000, label: "1 MB" });
  if (file) {
    newAvatar.value = file;
  }
}

function onFileChange(event: Event) {
  const file = handleFileChange(event, { value: 1000000, label: "1 MB" });
  if (file) {
    newAvatar.value = file;
  }
}
</script>
