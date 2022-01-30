<template>
  <div class="flex items-end justify-between">
    <LinkButton @click="copy(link)" class="relative text-xs text-slate-700">
      <transition
        mode="out-in"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-70 opacity-0 translate-y-2"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0 -translate-y-2"
      >
        <p class="" v-if="copied">Copied!</p>
        <span v-else>{{ link }}</span>
      </transition>
    </LinkButton>
    <GhostButton
      size="small"
      class="relative"
      @mouseenter="toggleTooltip"
      @mouseleave="toggleTooltip"
      @focus="toggleTooltip"
      @blur="toggleTooltip"
      @click="emit('revoke')"
    >
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-70 opacity-0 translate-y-2"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0 -translate-y-2"
      >
        <p
          v-if="showTooltip"
          class="absolute z-10 bg-neutral-50 bottom-8 text-sm p-2 rounded-md shadow-md border border-solid border-gray-100"
        >
          Revoke
        </p>
      </transition>
      <BanIcon class="h-4 w-4" />
    </GhostButton>
  </div>
</template>
<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { computed, toRefs, ref } from "vue";
import { BanIcon } from "@heroicons/vue/outline";
import LinkButton from "../Buttons/LinkButton.vue";
import GhostButton from "../Buttons/GhostButton.vue";

const showTooltip = ref(false);

function toggleTooltip() {
  showTooltip.value = !showTooltip.value;
}

const emit = defineEmits(["revoke"]);

const props = defineProps({
  invite: {
    type: String,
    required: true,
  },
});
toRefs(props);

const link = computed(() => `https://localhost:3000/invite/${props.invite}`);

const { copy, copied } = useClipboard();
</script>
