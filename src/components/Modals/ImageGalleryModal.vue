<template>
  <BaseModal title="Select an image" :open="open">
    <DismissButton
      class="absolute top-4 right-4"
      label="Close"
      @click="emit('close')"
    />
    <LoadingSpinner v-if="loading" color="brand-500" />
    <section v-else class="grid grid-cols-2 lg:grid-cols-3 gap-8 my-8">
      <ImageButton
        v-for="image in coverImages"
        :key="image.id"
        :image="image"
        @select="emit('select', $event)"
      />
    </section>
  </BaseModal>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/supabase";
import BaseModal from "./BaseModal.vue";
import { store } from "@/store";
import ImageButton from "../ImageButton.vue";
import LoadingSpinner from "../LoadingSpinner.vue";
import DismissButton from "../Buttons/DismissButton.vue";
import { FileObject } from "@supabase/storage-js";

const emit = defineEmits(["select", "close"]);

defineProps({
  open: {
    type: Boolean,
    required: true,
  },
});

const loading = ref(true);
const coverImages = ref<FileObject[]>([]);

onMounted(async () => {
  await getUserCoverImages();
  loading.value = false;
});

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
    coverImages.value = data;
  }
}
</script>
