<template>
  <div class="sr-only">Loading</div>
  <div class="spinner flex space-x-1">
    <div class="bounce1" :class="`bg-${color}`"></div>
    <div class="bounce2" :class="`bg-${color}`"></div>
    <div class="bounce3" :class="`bg-${color}`"></div>
  </div>
</template>
<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps({
  color: {
    type: String,
    default: "brand-500",
  },
});
toRefs(props);
</script>
<style scoped>
.spinner {
  text-align: center;
}

.spinner > div {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 100%;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@-webkit-keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
  }
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
