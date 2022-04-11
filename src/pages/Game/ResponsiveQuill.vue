<template>
  <QuillEditor ref="editor" :content="content" theme="bubble" read-only />
</template>
<script setup lang="ts">
import { PropType, watch, ref } from "vue";
import { Delta } from "@vueup/vue-quill";
const props = defineProps({
  content: {
    type: Object as PropType<Delta>,
    default: () => ({}),
  },
});
const editor = ref();
watch(
  () => props.content,
  (newContent) => {
    editor.value.setContents(newContent);
  }
);
</script>
