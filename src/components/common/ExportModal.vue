<!-- src/components/common/ExportModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Export Book</h3>
        <button @click="close" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- Export Options -->
      <div class="space-y-3">
        <button
          @click="handleExport('pdf')"
          :disabled="isExporting"
          class="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition"
        >
          <div class="flex items-center">
            <span class="text-2xl mr-3">📄</span>
            <div>
              <div class="font-semibold">PDF Document</div>
              <div class="text-sm text-gray-600">Best for printing and sharing</div>
            </div>
          </div>
        </button>

        <button
          @click="handleExport('epub')"
          :disabled="isExporting"
          class="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition"
        >
          <div class="flex items-center">
            <span class="text-2xl mr-3">📚</span>
            <div>
              <div class="font-semibold">EPUB</div>
              <div class="text-sm text-gray-600">For e-readers and tablets</div>
            </div>
          </div>
        </button>

        <button
          @click="handleExport('docx')"
          :disabled="isExporting"
          class="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition"
        >
          <div class="flex items-center">
            <span class="text-2xl mr-3">📝</span>
            <div>
              <div class="font-semibold">DOCX (Word)</div>
              <div class="text-sm text-gray-600">Edit in Microsoft Word</div>
            </div>
          </div>
        </button>
      </div>

      <!-- Progress Bar -->
      <div v-if="isExporting" class="mt-4">
        <div class="flex justify-between text-sm mb-1">
          <span>Exporting...</span>
          <span>{{ exportProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: exportProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useExport } from '@/composables/useExport'
import { useBookStore } from '@/stores/bookStore'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useBookStore()
const { isExporting, exportProgress, exportAsPDF, exportAsEPUB, exportAsDOCX } = useExport()
const error = ref<string>('')

const close = () => {
  if (!isExporting.value) {
    emit('close')
    error.value = ''
  }
}

const handleExport = async (format: 'pdf' | 'epub' | 'docx') => {
  error.value = ''
  try {
    switch (format) {
      case 'pdf':
        await exportAsPDF(store.book)
        break
      case 'epub':
        await exportAsEPUB(store.book)
        break
      case 'docx':
        await exportAsDOCX(store.book)
        break
    }
    // Auto-close after successful export
    setTimeout(() => emit('close'), 1000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Export failed'
  }
}
</script>