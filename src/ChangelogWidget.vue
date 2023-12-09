<template>
  <button
    id="headway-trigger"
    class="fixed bottom-12 right-12 bg-white rounded-full px-3 py-2 shadow-lg flex items-center z-20"
  >
    <BellAlertIcon class="w-5 h-5 text-slate-700" />
    <div class="absolute -top-2 -right-2">
      <span class="headway" />
    </div>
  </button>
</template>
<script setup lang="ts">
import { BellAlertIcon } from "@heroicons/vue/24/outline";
import { onMounted, ref } from "vue";

const loaded = ref(false);
const APP_ID = "7vbAk7";

const loadScript = async () => {
  const script = document.createElement("script");
  script.setAttribute("src", "//cdn.headwayapp.co/widget.js");
  script.addEventListener("load", () => {
    loaded.value = true;
    initHeadway();
  });
  script.async = true;
  document.head.appendChild(script);
};

function initHeadway() {
  const config = {
    selector: ".headway",
    account: APP_ID,
    trigger: "#headway-trigger",
    translations: {
      title: "Latest updates",
    },
  };
  // @ts-expect-error doesn't know about Headway
  window.Headway?.init(config);
}

onMounted(async () => {
  await loadScript();
});
</script>
