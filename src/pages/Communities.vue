<template>
  <base-template>
    <Heading level="h1">Communities</Heading>
    <section class="mt-12 flex justify-between items-baseline text-sm">
      <div class="flex space-x-4 py-2">
        <router-link
          to="/communities"
          activeClass="border-b border-brand-500 dark:border-brand-300"
        >
          All
        </router-link>
        <router-link
          to="/communities?filter=joined"
          activeClass="border-b border-brand-500 dark:border-brand-300"
        >
          Joined
        </router-link>
      </div>
      <router-link to="/communities/new" class="hover:underline">
        Create a new community
      </router-link>
    </section>
    <section class="grid grid-cols-1 gap-8 mt-12">
      <span v-if="isLoading" class="place-self-center">
        <LoadingSpinner color="brand-500" />
      </span>
      <template v-else v-for="community in allCommunities" :key="community.id">
        <Listing :heading="community.name">
          <template #website>
            <a
              class="hover:underline active:underline text-slate-600 dark:text-slate-400 prose prose-sm"
              :href="community.website"
            >
              {{ community.website }}
            </a>
          </template>
          <template #description>{{ community.description }}</template>
        </Listing>
        <hr class="last:hidden border-gray-300" />
      </template>
    </section>
  </base-template>
</template>
<script setup lang="ts">
import BaseTemplate from "@/components/BaseTemplate.vue";
import Heading from "@/components/Heading.vue";
import Listing from "@/components/Listing.vue";
import { supabase } from "@/supabase";
import { Community } from "@/typings/Community";
import { log } from "@/util/logger";
import { ref, onMounted } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const isLoading = ref(false);
const allCommunities = ref([] as Community[]);

onMounted(loadAllCommunities);

async function loadAllCommunities() {
  isLoading.value = true;
  const { data, error } = await supabase.from("communities").select();
  if (error) {
    log({ error });
  }
  if (data) {
    allCommunities.value = data;
  }
  isLoading.value = false;
}
</script>
