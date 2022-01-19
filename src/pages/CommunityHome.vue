<template>
  <div class="p-8 bg-slate-100 rounded-lg border border-solid border-slate-200">
    <p class="prose dark:prose-invert prose-lg whitespace-pre-wrap">
      {{ community.description }}
    </p>
    <p class="text-xs text-slate-600 mt-8">
      Community since
      {{ format(new Date(community.created_at), "LLL do, yyyy") }}
    </p>
  </div>
</template>
<script setup lang="ts">
import { Community } from "@/typings/Community";
import { PropType, toRefs } from "vue";
import { format } from "date-fns";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});
toRefs(props);
</script>
