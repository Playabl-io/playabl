<template>
  <div class="flex flex-col">
    <FormLabel> Search </FormLabel>
    <FormInput v-model="search" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import FormLabel from "../Forms/FormLabel.vue";
import { watchDebounced } from "@vueuse/core";
import FormInput from "../Forms/FormInput.vue";
const route = useRoute();
const router = useRouter();

defineProps({
  label: {
    type: String,
    default: undefined,
  },
});

const search = ref(
  Array.isArray(route.query.search)
    ? route.query.search.join(" ")
    : route.query.search ?? ""
);

watchDebounced(
  search,
  () => {
    router.push({
      path: route.path,
      query: {
        ...route.query,
        search: search.value,
      },
    });
  },
  { debounce: 500, maxWait: 1000 }
);
</script>
