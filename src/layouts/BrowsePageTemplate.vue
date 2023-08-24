<template>
  <div class="grid md:grid-cols-3 gap-6 h-full">
    <div>
      <div class="flex flex-col gap-6 sticky top-24">
        <PrimaryButton
          v-if="allowCreateNew"
          class="shadow-sm"
          @click="emit('createNew')"
        >
          New {{ title }}
        </PrimaryButton>
        <div class="rounded-md bg-white shadow-sm flex flex-col gap-6 p-4">
          <slot name="page-controls"></slot>
        </div>
      </div>
    </div>
    <div class="md:col-span-2 rounded-md w-full">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";

defineProps({
  allowCreateNew: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["createNew"]);
</script>
<style scoped>
.controls {
  max-height: 80%;
}
.controls {
  max-height: 80%;
}
</style>
