<template>
  <img
    v-if="imagePath"
    :class="`${SIZE_MAP[size]} rounded-full object-cover`"
    :src="imagePath"
    :alt="`${username}'s avatar`"
  />
  <div
    v-else
    :class="`${SIZE_MAP[size]} rounded-full grid place-items-center ${avatarStyles}`"
  >
    <p>
      {{ username.charAt(0) }}
    </p>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { getAvatarImageUrl } from "@/api/storage";
const props = defineProps({
  avatarUrl: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "regular",
  },
});

const SIZE_MAP = {
  regular: "h-14 w-14",
  small: "h-8 w-8",
};

const imagePath = ref("");

onMounted(async () => {
  if (props.avatarUrl) {
    imagePath.value = await getAvatarImageUrl(props.avatarUrl);
  }
});

watch(
  () => props.avatarUrl,
  async (newAvatarUrl) => {
    if (newAvatarUrl) {
      imagePath.value = await getAvatarImageUrl(newAvatarUrl);
    }
  }
);

const avatarChar = computed(() => props.username.charAt(0));
const avatarStyles = computed(() => getColorCombo(avatarChar.value));

function getColorCombo(character: string) {
  return /[A-F]/i.test(character)
    ? "bg-sky-100 text-sky-800"
    : /[G-N]/i.test(character)
    ? "bg-violet-100 text-violet-800"
    : "bg-green-100 text-green-800";
}
</script>
