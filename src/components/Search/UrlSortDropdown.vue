<template>
  <div class="grid gap-4">
    <div class="flex flex-col">
      <FormLabel>Sort by</FormLabel>
      <FormSelect v-model="selectedSortKey">
        <option
          v-for="option in sortKeyOptions"
          :key="option.value"
          :value="option.value"
          :selected="selectedSortKey === option.value"
        >
          {{ option.label }}
        </option>
      </FormSelect>
    </div>
    <div class="flex flex-col">
      <FormLabel>Sort direction</FormLabel>
      <FormSelect v-model="selectedSortDir">
        <option
          v-for="option in sortDirOptions"
          :key="option.value"
          :value="option.value"
          :selected="selectedSortDir === option.value"
        >
          {{ option.label }}
        </option>
      </FormSelect>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import FormLabel from "../Forms/FormLabel.vue";
import { useUrlSearchParams } from "@vueuse/core";
import {
  SORT_KEY_PATH,
  SORT_DIR_PATH,
  sortDirOptions,
  sortKeyOptions,
} from "@/util/urlParams";
import FormSelect from "../Forms/FormSelect.vue";

const params = useUrlSearchParams("history");
const route = useRoute();
const router = useRouter();

defineProps({
  label: {
    type: String,
    default: undefined,
  },
});

const selectedSortKey = ref(
  (params[SORT_KEY_PATH] as string) || sortKeyOptions[0].value
);
const selectedSortDir = ref(
  (params["sort.dir"] as string) || sortDirOptions[0].value
);

watch([selectedSortKey, selectedSortDir], () => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      [SORT_KEY_PATH]: selectedSortKey.value,
      [SORT_DIR_PATH]: selectedSortDir.value,
    },
  });
});
</script>
