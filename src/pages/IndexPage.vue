<template>
  <BaseTemplate>
    <div class="max-w-2xl mx-auto">
      <InfoBanner
        v-if="showConfirmEmailBanner"
        @dismiss="showConfirmEmailBanner = false"
      >
        <p class="font-bold text-slate-700">
          Email change initiated. Please confirm by following the link sent to
          the new email.
        </p>
      </InfoBanner>
      <h1
        class="text-center font-paytone bg-gradient-to-b from-violet-500 to-violet-700 text-transparent text-6xl md:text-9xl drop-shadow-2xl bg-clip-text py-12"
      >
        Playabl
      </h1>

      <p class="text-center text-slate-700 text-lg mt-8">
        Playabl is a free and open source platform for finding and managing
        roleplaying communities and games.
      </p>
      <div class="mt-8 text-slate-700 text-center">
        <p>
          Want to help make Playabl better?<br />
          <a
            className="text-brand-500 hover:underline"
            target="_blank"
            href="https://github.com/Playabl-io/playabl"
          >
            Check us out on GitHub </a
          >, or
          <a
            className="text-brand-500 hover:underline"
            target="_blank"
            href="https://github.com/Playabl-io/playabl/discussions/128"
          >
            read more about ways you can get involved.
          </a>
        </p>
      </div>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref } from "vue";
import InfoBanner from "@/components/Banners/InfoBanner.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { useRoute } from "vue-router";
const route = useRoute();
const showConfirmEmailBanner = ref(
  route.hash.includes(
    "#message=Confirmation+link+accepted.+Please+proceed+to+confirm+link+sent+to+the+other+email"
  )
);
</script>
