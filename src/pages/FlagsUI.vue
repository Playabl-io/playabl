<template>
  <BaseTemplate>
    <Heading as="h1" level="h6" class="mb-6">Feature flags</Heading>
    <FormLabel
      v-for="flag in flags"
      :key="flag.id"
      class="flex items-center first:my-0 my-3"
    >
      <FormCheckbox
        :model-value="store.userEnabledFlags[flag.flag]"
        class="mr-3"
        @update:model-value="store.userEnabledFlags[flag.flag] = $event"
      />
      {{ flag.flag }}
    </FormLabel>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { store } from "@/store";
import { supabase } from "@/supabase";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import Heading from "@/components/Heading.vue";

const router = useRouter();

const flags = ref<
  { id: number; flag: string; user_ids: string[]; community_ids: string[] }[]
>([]);

onMounted(async () => {
  if (!store.userEnabledFlags.flags_ui) {
    router.replace("/");
  }
  const { data } = await supabase.from("flags").select("*");
  if (data) {
    flags.value = data;
  }
});
</script>
