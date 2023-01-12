<template>
  <router-link
    :to="route || `/communities/${community.url_short_name || community.id}`"
    class="border border-solid border-gray-300 rounded-lg focus-styles"
  >
    <div
      v-if="coverImageUrl"
      class="w-full relative"
      :class="{
        'aspect-w-16 aspect-h-9': coverImageUrl,
      }"
    >
      <img
        class="w-full h-full object-center object-cover rounded-t-lg"
        :src="coverImageUrl"
        alt="image"
      />
    </div>
    <div class="p-4 rounded-b-lg">
      <Heading as="h6" level="h6">{{ community.name }} </Heading>
    </div>
  </router-link>
</template>
<script setup lang="ts">
import { PropType, ref, onMounted } from "vue";
import Heading from "../Heading.vue";
import { getCoverImageUrl } from "@/api/storage";
import { Community } from "@/typings/Community";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
  route: {
    type: String,
    default: null,
  },
});

const coverImageUrl = ref("");

onMounted(async () => {
  if (props.community.cover_image) {
    const publicUrl = await getCoverImageUrl(props.community.cover_image);
    if (publicUrl) {
      coverImageUrl.value = publicUrl;
    }
  }
});
</script>
