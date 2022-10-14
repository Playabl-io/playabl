<template>
  <div class="h-screen w-screen grid place-content-center">
    <transition
      mode="out-in"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-70 opacity-0 translate-y-2"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-out"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <p v-if="!finished">
        Welcome back. We'll finish setting up your slack integration...
      </p>
      <p v-else>All finished! You can close this tab now.</p>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

const route = useRoute();
const code = route.query.code;

const finished = ref(false);

onMounted(async () => {
  const integrationId = route.query.state;

  await axios.post(
    `/.netlify/functions/authorizeSlack?code=${code}&integrationId=${integrationId}`
  );
  finished.value = true;
});
</script>
