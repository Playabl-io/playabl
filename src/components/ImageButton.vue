<template>
  <BaseButton
    v-if="src"
    class="aspect-w-16 aspect-h-9"
    @click="emit('select', { image, src })"
  >
    <img
      :alt="image.name"
      :src="src"
      class="w-full h-full object-center object-cover rounded-lg"
      loading="lazy"
    />
  </BaseButton>
  <div
    v-else
    class="aspect-w-16 aspect-h-9 bg-gradient-to-b from-gray-300 to-gray-50 rounded-lg"
  />
</template>
<script lang="ts" setup>
import { getCoverImageUrl } from "@/api/storage";
import { store } from "@/store";
import { FileObject } from "@/typings/Storage";
import { onMounted, PropType, ref } from "vue";
import BaseButton from "./Buttons/BaseButton.vue";

const emit = defineEmits(["select"]);

const props = defineProps({
  image: {
    type: Object as PropType<FileObject>,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const src = ref("");
onMounted(async () => {
  if (!store.user?.id) return;
  src.value = await getCoverImageUrl(`${store.user.id}/${props.image.name}`);
});
</script>
