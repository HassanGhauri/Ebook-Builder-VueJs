<!-- src/components/editor/EditorContent.vue -->
<template>
  <div class="editor-wrapper">
    <!-- Full Toolbar -->
    <div class="toolbar flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <!-- Text Formatting -->
      <div class="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2">
        <button
          @click="editor?.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor?.isActive('bold') }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          @click="editor?.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor?.isActive('italic') }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          @click="editor?.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor?.isActive('underline') }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          @click="editor?.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor?.isActive('strike') }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Strikethrough"
        >
          <s>S</s>
        </button>
      </div>

      <!-- Headings -->
      <div class="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2">
        <button
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
          title="Heading 1"
        >
          H1
        </button>
        <button
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
          title="Heading 2"
        >
          H2
        </button>
        <button
          @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <!-- Lists -->
      <div class="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2">
        <button
          @click="editor?.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor?.isActive('bulletList') }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Bullet List"
        >
          • List
        </button>
        <button
          @click="editor?.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor?.isActive('orderedList') }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      <!-- Alignment -->
      <div class="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2">
        <button
          @click="editor?.chain().focus().setTextAlign('left').run()"
          :class="{ 'is-active': editor?.isActive({ textAlign: 'left' }) }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Align Left"
        >
          ⬅️
        </button>
        <button
          @click="editor?.chain().focus().setTextAlign('center').run()"
          :class="{ 'is-active': editor?.isActive({ textAlign: 'center' }) }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Align Center"
        >
          ⬛
        </button>
        <button
          @click="editor?.chain().focus().setTextAlign('right').run()"
          :class="{ 'is-active': editor?.isActive({ textAlign: 'right' }) }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Align Right"
        >
          ➡️
        </button>
        <button
          @click="editor?.chain().focus().setTextAlign('justify').run()"
          :class="{ 'is-active': editor?.isActive({ textAlign: 'justify' }) }"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Justify"
        >
          ↔️
        </button>
      </div>

      <!-- History (Undo/Redo) -->
      <div class="flex items-center gap-1">
        <button
          @click="editor?.chain().focus().undo().run()"
          :disabled="!editor?.can().undo()"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
          title="Undo"
        >
          ↩
        </button>
        <button
          @click="editor?.chain().focus().redo().run()"
          :disabled="!editor?.can().redo()"
          class="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
          title="Redo"
        >
          ↪
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="editor-content p-6 min-h-[500px] bg-white dark:bg-gray-900">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
  },
})

// Update editor when prop changes
watch(() => props.modelValue, (newContent) => {
  if (editor.value && editor.value.getHTML() !== newContent) {
    editor.value.commands.setContent(newContent)
  }
})

onMounted(() => {
  if (editor.value) {
    // Editor is ready
  }
})
</script>

<style scoped>
.is-active {
  @apply bg-blue-500 text-white dark:bg-blue-600;
}

:deep(.ProseMirror) {
  @apply outline-none min-h-[400px] dark:text-white;
}

:deep(.ProseMirror h1) {
  @apply text-3xl font-bold mb-4 dark:text-white;
}

:deep(.ProseMirror h2) {
  @apply text-2xl font-bold mb-3 dark:text-white;
}

:deep(.ProseMirror h3) {
  @apply text-xl font-bold mb-3 dark:text-white;
}

:deep(.ProseMirror p) {
  @apply mb-3 dark:text-gray-200;
}

:deep(.ProseMirror ul) {
  @apply list-disc pl-6 mb-3 dark:text-gray-200;
}

:deep(.ProseMirror ol) {
  @apply list-decimal pl-6 mb-3 dark:text-gray-200;
}

:deep(.ProseMirror li) {
  @apply mb-1 dark:text-gray-200;
}

:deep(.ProseMirror blockquote) {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic dark:text-gray-300;
}

:deep(.ProseMirror hr) {
  @apply my-4 border-t border-gray-300 dark:border-gray-600;
}

:deep(.ProseMirror .is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Toolbar button styles */
.toolbar button {
  @apply text-gray-700 dark:text-gray-300;
}

.toolbar button.is-active {
  @apply bg-blue-500 text-white dark:bg-blue-600;
}

.toolbar button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Dark mode input styles */
.dark input[type="color"] {
  @apply bg-gray-700 border-gray-600;
}
</style>