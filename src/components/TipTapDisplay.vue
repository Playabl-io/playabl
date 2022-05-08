<template>
  <editor-content :editor="editor" />
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

const editor = useEditor({
  editable: false,
  content: props.content,
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: "prose sm:prose-sm lg:prose-lg w-full",
    },
  },
});
</script>
