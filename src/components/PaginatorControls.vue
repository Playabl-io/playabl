<template>
  <div class="flex gap-2">
    <GhostButton
      v-if="currentPage !== 0"
      :disabled="currentPage === 0"
      size="small"
      round
      @click="emit('pageSelect', 0)"
    >
      <ChevronDoubleLeftIcon class="h-4 w-4 text-slate-700" />
    </GhostButton>
    <GhostButton
      v-if="currentPage !== 0"
      size="small"
      round
      @click="emit('pageSelect', currentPage - 1)"
    >
      {{ displayPage - 1 }}
    </GhostButton>
    <BaseButton disabled class="rounded-full bg-gray-200" size="small" round>
      {{ displayPage }}
    </BaseButton>
    <GhostButton
      v-if="currentPage + 1 < pageCount"
      size="small"
      round
      @click="emit('pageSelect', currentPage + 1)"
    >
      {{ displayPage + 1 }}
    </GhostButton>
    <GhostButton
      v-if="currentPage + 1 < pageCount"
      size="small"
      round
      @click="emit('pageSelect', pageCount - 1)"
    >
      <ChevronDoubleRightIcon class="h-4 w-4 text-slate-700" />
    </GhostButton>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/vue/20/solid";
import GhostButton from "./Buttons/GhostButton.vue";
import BaseButton from "./Buttons/BaseButton.vue";

const emit = defineEmits(["pageSelect"]);

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  currentPage: {
    type: Number,
    required: true,
  },
});

const pageCount = computed(() => Math.ceil(props.count / props.pageSize));
const displayPage = computed(() => props.currentPage + 1);
</script>
