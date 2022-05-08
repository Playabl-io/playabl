<template>
  <div class="flex gap-1 m-1">
    <button
      type="button"
      :class="{
        'bg-gray-200/60': editor?.isActive('bold'),
      }"
      class="p-2 rounded-md focus-styles hover:bg-gray-200/60"
      @click="editor?.chain().focus().toggleBold().run()"
    >
      <Icon icon="bi:type-bold" />
    </button>
    <button
      type="button"
      :class="{
        'bg-gray-200/60': editor?.isActive('italic'),
      }"
      class="p-2 rounded-md focus-styles hover:bg-gray-200/60"
      @click="editor?.chain().focus().toggleItalic().run()"
    >
      <Icon icon="bi:type-italic" />
    </button>
    <button
      type="button"
      :class="{
        'bg-gray-200/60': editor?.isActive('heading', { level: 1 }),
      }"
      class="p-2 rounded-md focus-styles hover:bg-gray-200/60"
      @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
    >
      <Icon icon="bi:type-h1" />
    </button>
    <button
      type="button"
      :class="{
        'bg-gray-200/60': editor?.isActive('heading', { level: 2 }),
      }"
      class="p-2 rounded-md focus-styles hover:bg-gray-200/60"
      @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      <Icon icon="bi:type-h2" />
    </button>
    <button
      type="button"
      :class="{
        'bg-gray-200/60': editor?.isActive('heading', { level: 3 }),
      }"
      class="p-2 rounded-md focus-styles hover:bg-gray-200/60"
      @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
    >
      <Icon icon="bi:type-h3" />
    </button>
    <button
      type="button"
      :class="{
        'bg-gray-200/60': editor?.isActive('ol'),
      }"
      class="p-2 rounded-md focus-styles hover:bg-gray-200/60"
      @click="editor?.chain().focus().toggleOrderedList().run()"
    >
      <Icon icon="bi:list-ol" />
    </button>
    <button
      type="button"
      :class="{
        'bg-gray-200/60': editor?.isActive('ul'),
      }"
      class="p-2 rounded-md focus-styles hover:bg-gray-200/60"
      @click="editor?.chain().focus().toggleBulletList().run()"
    >
      <Icon icon="bi:list-ul" />
    </button>
  </div>
  <editor-content :editor="editor" />
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Icon } from "@iconify/vue";
import { watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: "Draft a message",
  },
  editorHeight: {
    type: String,
    default: "h-40",
  },
});

const emit = defineEmits(["update:modelValue"]);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class: `prose sm:prose-sm lg:prose-lg px-4 py-2 rounded-lg w-full ${props.editorHeight} overflow-auto`,
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
</style>
