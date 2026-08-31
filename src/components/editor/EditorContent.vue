<!-- src/components/editor/EditorContent.vue -->
<template>
  <div class="editor-wrapper">
    <!-- Toolbar -->
    <div class="toolbar flex flex-wrap gap-2 p-2 bg-gray-50 border-b border-gray-200">
      <button
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor?.isActive('bold') }"
        class="px-3 py-1 rounded hover:bg-gray-200"
      >
        <strong>B</strong>
      </button>
      <button
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor?.isActive('italic') }"
        class="px-3 py-1 rounded hover:bg-gray-200"
      >
        <em>I</em>
      </button>
      <button
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }"
        class="px-3 py-1 rounded hover:bg-gray-200"
      >
        H1
      </button>
      <button
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }"
        class="px-3 py-1 rounded hover:bg-gray-200"
      >
        H2
      </button>
      <button
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor?.isActive('bulletList') }"
        class="px-3 py-1 rounded hover:bg-gray-200"
      >
        • List
      </button>
      <button
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor?.isActive('orderedList') }"
        class="px-3 py-1 rounded hover:bg-gray-200"
      >
        1. List
      </button>
      <button
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
        class="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
      >
        ↩
      </button>
      <button
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
        class="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
      >
        ↪
      </button>
    </div>

    <!-- Editor Content -->
    <div class="editor-content p-6 min-h-[500px] bg-white">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  extensions: [StarterKit],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
  },
})

// Update editor when prop changes (e.g., switching pages)
watch(() => props.modelValue, (newContent) => {
  if (editor.value && editor.value.getHTML() !== newContent) {
    editor.value.commands.setContent(newContent)
  }
})

// Cleanup on unmount
onMounted(() => {
  if (editor.value) {
    // Add any editor setup here
  }
})
</script>

<style scoped>
.is-active {
  @apply bg-blue-500 text-white;
}
:deep(.ProseMirror) {
  @apply outline-none min-h-[400px];
}
:deep(.ProseMirror h1) {
  @apply text-3xl font-bold mb-4;
}
:deep(.ProseMirror h2) {
  @apply text-2xl font-bold mb-3;
}
:deep(.ProseMirror p) {
  @apply mb-3;
}
:deep(.ProseMirror ul) {
  @apply list-disc pl-6 mb-3;
}
:deep(.ProseMirror ol) {
  @apply list-decimal pl-6 mb-3;
}
</style>