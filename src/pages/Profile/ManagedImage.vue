<template>
  <label
    v-if="src"
    class="relative focus-styles-within rounded-lg cursor-pointer"
    :class="{
      'shadow-xl': selected,
    }"
  >
    <div
      v-if="selected"
      class="absolute -top-2 -right-2 z-10 rounded-full p-1 bg-indigo-200 shadow-md flex justify-center items-center"
    >
      <CheckIcon class="w-5 h-5 text-indigo-600" />
    </div>
    <input
      class="w-0 h-0 opacity-0 absolute"
      :checked="selected"
      type="checkbox"
      @change="handleChange"
    />
    <div class="aspect-w-16 aspect-h-9">
      <img
        :alt="image.name"
        :src="src"
        class="w-full h-full object-center object-cover rounded-lg"
        loading="lazy"
      />
    </div>
    <p class="font-semibold">{{ image.name }}</p>
    <p class="text-sm text-slate-700">
      {{ bytesToMb(image.metadata.size) }} MB
    </p>
  </label>
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
import { CheckIcon } from "@heroicons/vue/24/outline";
import { bytesToMb } from "@/util/math";

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

function handleChange(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("select", { image: props.image, checked: element.checked });
}
</script>
