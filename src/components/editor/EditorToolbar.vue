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

      <!-- Manual Save Button -->
      <button
        @click="handleSave"
        :disabled="isSaving"
        class="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Save your book manually"
      >
        <span v-if="isSaving" class="inline-block animate-spin">⟳</span>
        <span v-else>💾</span>
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>
    </div>

    <!-- Right Side - Status & Info -->
    <div class="flex items-center gap-3">
      <!-- Single Save Status -->
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{ saveStatus }}
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
import { computed, ref, watch } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { useBookStats } from '@/composables/useBookStats'
import { useStorage } from '@/composables/useStorage'

const emit = defineEmits<{
  (e: 'import'): void
  (e: 'export'): void
  (e: 'preview'): void
  (e: 'cover'): void
}>()

const store = useBookStore()
const { saveBook } = useStorage()
const { totalWords } = useBookStats(store.book)

// State
const isSaving = ref(false)
const saveStatus = ref('💾 Saved')
let statusTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const currentPageIndex = computed(() => store.book.currentPageIndex)
const totalPages = computed(() => store.book.pages.length)
const wordCount = computed(() => totalWords.value)

// Watch for changes to update status
watch(
  () => store.book.metadata.updatedAt,
  () => {
    // Auto-save happened or content changed
    if (!isSaving.value) {
      saveStatus.value = '✏️ Editing...'
      clearTimeout(statusTimeout!)
      statusTimeout = setTimeout(() => {
        saveStatus.value = '💾 Saved'
      }, 1500)
    }
  },
  { deep: true }
)

// Methods
const handleSave = async () => {
  if (isSaving.value) return
  
  isSaving.value = true
  saveStatus.value = '💾 Saving...'
  
  try {
    // IMPORTANT: Create a plain object copy to avoid reactivity issues
    const plainBook = JSON.parse(JSON.stringify(store.book))
    await saveBook(plainBook)
    saveStatus.value = '✅ Saved!'
    
    // Reset after 2 seconds
    clearTimeout(statusTimeout!)
    statusTimeout = setTimeout(() => {
      saveStatus.value = '💾 Saved'
      isSaving.value = false
    }, 2000)
  } catch (error) {
    console.error('Save failed:', error)
    saveStatus.value = '❌ Save failed'
    
    clearTimeout(statusTimeout!)
    statusTimeout = setTimeout(() => {
      saveStatus.value = '💾 Saved'
      isSaving.value = false
    }, 3000)
  }
}
</script>

<style scoped>
.editor-toolbar {
  min-height: 48px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
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