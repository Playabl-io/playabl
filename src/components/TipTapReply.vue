<template>
  <editor-content :editor="editor" />
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { PropType, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  sendShortcut: {
    type: String as PropType<"enter" | "enterWithModifier">,
    default: () => "enter",
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const editor = useEditor({
  editable: !props.disabled,
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: "Reply...",
    }),
  ],
  editorProps: {
    attributes: {
      class:
        "prose sm:prose-sm lg:prose-lg no-max-w px-4 py-1 focus-styles rounded-lg border border-solid border-brand-500 max-h-60 overflow-auto",
    },
    handleKeyDown(view, event) {
      const shiftOrMetaPressed = event.shiftKey || event.metaKey;
      if (event.key === "Enter" && shiftOrMetaPressed) {
        if (props.sendShortcut === "enterWithModifier") {
          emit("submit");
          return true;
        }
        return false;
      }
      if (event.key === "Enter") {
        if (props.sendShortcut === "enter") {
          emit("submit");
          return true;
        }
        return false;
      }
      return false;
    },
  },
  onUpdate: () => {
    emit("update:modelValue", editor.value?.getHTML());
  },
});

watch(
  () => props.modelValue,
  (newValue = "") => {
    if (newValue !== editor.value?.getHTML()) {
      editor.value?.commands.setContent(newValue, false);
    }
  }
);
watch(
  () => props.disabled,
  (newValue) => {
    editor.value?.setEditable(!newValue);
  }
);
</script>
<style>
/* Placeholder (at the top) */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #acacac;
  pointer-events: none;
  height: 0;
}
.no-max-w {
  max-width: 100% !important;
}
</style>
