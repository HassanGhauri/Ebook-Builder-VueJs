<!-- src/components/common/ImportModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Import Book</h3>
        <button @click="close" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- Drag and Drop Area -->
      <div
        @dragover.prevent
        @drop.prevent="handleDrop"
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition"
      >
        <div class="text-4xl mb-3">📁</div>
        <p class="text-gray-600">Drop your file here or</p>
        <label class="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
          Browse Files
          <input
            type="file"
            accept=".docx,.txt"
            @change="handleFileSelect"
            class="hidden"
          />
        </label>
        <p class="text-xs text-gray-500 mt-3">Supports: .docx, .txt</p>
      </div>

      <!-- Error Message -->
      <div v-if="importError" class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm">
        {{ importError }}
      </div>

      <!-- Progress -->
      <div v-if="isImporting" class="mt-4 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-sm text-gray-600">Importing...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useImport } from '@/composables/useImport'
import { useBookStore } from '@/stores/bookStore'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported'): void
}>()

const store = useBookStore()
const { isImporting, importError, importFromDOCX, importFromText } = useImport()

const close = () => {
  if (!isImporting.value) {
    emit('close')
  }
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    await processFile(file)
  }
}

const handleDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await processFile(file)
  }
}

const processFile = async (file: File) => {
  try {
    let importedBook: Partial<typeof store.book>
    
    if (file.name.endsWith('.docx')) {
      importedBook = await importFromDOCX(file)
    } else if (file.name.endsWith('.txt')) {
      importedBook = await importFromText(file)
    } else {
      throw new Error('Unsupported file format')
    }
    
    // Update the store with imported data
    if (importedBook.metadata) {
      store.book.metadata = {
        ...store.book.metadata,
        ...importedBook.metadata,
      }
    }
    
    if (importedBook.pages) {
      store.book.pages = importedBook.pages
      store.book.currentPageIndex = 0
    }
    
    emit('imported')
    emit('close')
  } catch (error) {
    console.error('Import failed:', error)
  }
}
</script>