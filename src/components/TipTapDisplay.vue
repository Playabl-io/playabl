<template>
  <editor-content :editor="editor" />
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import { watch } from "vue";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

const editor = useEditor({
  editable: false,
  content: props.content,
  extensions: [
    StarterKit,
    LinkExtension.configure({
      protocols: ["mailto"],
    }),
  ],
  editorProps: {
    attributes: {
      class: "prose sm:prose-sm lg:prose-lg w-full md:!max-w-4xl lg:!max-w-6xl",
    },
  },
});

watch(
  () => props.content,
  (newValue = "") => {
    if (newValue !== editor.value?.getHTML()) {
      editor.value?.commands.setContent(newValue, false);
    }
  }
);
</script>
