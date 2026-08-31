<!-- src/components/editor/EditorToolbar.vue -->
<template>
  <div class="editor-toolbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
    <!-- Left Side - File Actions -->
    <div class="flex items-center flex-wrap gap-2">
      <!-- Import Button -->
      <button
        @click="$emit('import')"
        class="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition flex items-center gap-1"
        title="Import a book from file"
      >
        📥 Import
      </button>

      <!-- Export Button -->
      <button
        @click="$emit('export')"
        class="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition flex items-center gap-1"
        title="Export book to various formats"
      >
        📤 Export
      </button>

      <!-- Preview Button -->
      <button
        @click="$emit('preview')"
        class="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition flex items-center gap-1"
        title="Preview book in reader mode"
      >
        👁️ Preview
      </button>

      <!-- Cover Generator Button -->
      <button
        @click="$emit('cover')"
        class="px-3 py-1.5 bg-pink-500 text-white text-sm rounded hover:bg-pink-600 transition flex items-center gap-1"
        title="Generate a book cover"
      >
        🎨 Cover
      </button>
    </div>

    <!-- Right Side - Status & Info -->
    <div class="flex items-center gap-3">
      <!-- Auto-save status -->
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{ autoSaveStatus }}
      </span>

      <!-- Page counter -->
      <span class="text-sm text-gray-400 dark:text-gray-500">
        {{ currentPageIndex + 1 }} / {{ totalPages }}
      </span>

      <!-- Word count badge -->
      <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
        📝 {{ wordCount }} words
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { useBookStats } from '@/composables/useBookStats'

defineEmits<{
  (e: 'import'): void
  (e: 'export'): void
  (e: 'preview'): void
  (e: 'cover'): void
}>()

defineProps<{
  autoSaveStatus: string
}>()

const store = useBookStore()
const { totalWords } = useBookStats(store.book)

const currentPageIndex = computed(() => store.book.currentPageIndex)
const totalPages = computed(() => store.book.pages.length)
const wordCount = computed(() => totalWords.value)
</script>

<style scoped>
.editor-toolbar {
  min-height: 48px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .editor-toolbar > div:first-child {
    flex-wrap: wrap;
  }
  
  .editor-toolbar button {
    flex: 1;
    justify-content: center;
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>