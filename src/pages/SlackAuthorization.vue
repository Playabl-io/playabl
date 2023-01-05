<template>
  <BaseTemplate>
    <div class="h-full w-full grid place-content-center">
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
        <p v-else-if="finished">
          All finished! We'll take you back to your community page now. Hold
          tight...
        </p>
        <p v-else-if="errored">
          Sorry, but we weren't able to finish setting up your slack
          integration. Please contact support@playabl.io or try again later.
        </p>
      </transition>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { log } from "@/util/logger";

const route = useRoute();
const code = route.query.code;
const community = route.query.community;

const errored = ref(false);
const finished = ref(false);

onMounted(async () => {
  const integrationId = route.query.state;

  try {
    await axios.post(
      `/.netlify/functions/authorizeSlack?code=${code}&integrationId=${integrationId}&community=${community}`
    );
    finished.value = true;
    setTimeout(() => {
      location.href = `${
        import.meta.env.VITE_PLAYABL_URL
      }/communities/${community}/manage/integrations`;
    }, 2000);
  } catch (error) {
    log({ error });
    errored.value = true;
  }
});
</script>
