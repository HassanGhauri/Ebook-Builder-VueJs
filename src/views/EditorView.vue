<!-- src/views/EditorView.vue -->
<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar - Table of Contents -->
    <div class="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold dark:text-white">Pages</h2>
        
        <!-- Add Page Button -->
        <button
          @click="addPage"
          class="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          + Add Page
        </button>
        
        <!-- Import Button -->
        <button
          @click="showImportModal = true"
          class="mt-2 w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          📥 Import Book
        </button>
        
        <!-- Preview Button -->
        <button
          @click="openPreview"
          class="mt-2 w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
        >
          👁️ Preview Book
        </button>
        
        <!-- Export Button -->
        <button
          @click="showExportModal = true"
          class="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          📤 Export Book
        </button>
        
        <!-- Cover Generator Button -->
        <button
          @click="showCoverGenerator = true"
          class="mt-2 w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
        >
          🎨 Generate Cover
        </button>
        
        <!-- Auto-save indicator -->
        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {{ autoSaveStatus }}
        </div>
      </div>

      <!-- Drag and Drop List -->
      <div class="flex-1 overflow-y-auto p-4">
        <VueDraggable
          v-model="pages"
          item-key="id"
          @update:model-value="handleReorder"
          class="space-y-2"
        >
          <template #item="{ element, index }">
            <div
              @click="setCurrentPage(index)"
              :class="[
                'p-3 rounded cursor-pointer flex items-center justify-between transition',
                currentPage?.id === element.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-500 dark:border-blue-400'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <span class="truncate dark:text-gray-200">{{ element.title }}</span>
              <button
                @click.stop="deletePage(element.id)"
                class="text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </template>
        </VueDraggable>
        
        <!-- Empty state -->
        <div v-if="pages.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-8">
          <p>No pages yet</p>
          <p class="text-sm">Click "Add Page" to get started</p>
        </div>
      </div>

      <!-- Book Metadata & Statistics -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 overflow-y-auto">
        <input
          v-model="bookTitle"
          @input="updateTitle"
          type="text"
          placeholder="Book Title"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        <input
          v-model="bookAuthor"
          @input="updateAuthor"
          type="text"
          placeholder="Author"
          class="w-full px-3 py-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        
        <!-- Book Statistics -->
        <BookStats :book="store.book" class="mt-3" />
        
        <!-- Stats -->
        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>{{ pages.length }} pages</span>
          <span>v{{ bookVersion }}</span>
        </div>
      </div>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-1 flex flex-col">
      <!-- Page Header -->
      <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <input
          v-model="pageTitle"
          @input="updatePageTitle"
          type="text"
          placeholder="Page Title"
          class="text-xl font-bold w-full border-none outline-none dark:bg-transparent dark:text-white"
        />
        <span class="text-sm text-gray-400 dark:text-gray-500">
          {{ currentPageIndex + 1 }} / {{ totalPages }}
        </span>
      </div>

      <!-- Editor -->
      <div class="flex-1 p-8 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <EditorContent
            v-if="currentPage"
            v-model="currentPage.content"
            @update:model-value="updateContent"
          />
          <div v-else class="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No page selected</p>
            <p class="text-sm">Add a new page to start writing</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <ImportModal
      :is-open="showImportModal"
      @close="showImportModal = false"
      @imported="onBookImported"
    />

    <!-- Export Modal -->
    <ExportModal
      :is-open="showExportModal"
      @close="showExportModal = false"
    />

    <!-- Book Preview -->
    <BookPreview
      v-if="showPreview"
      :book="store.book"
      @close="showPreview = false"
      @export="showExportModal = true"
    />

    <!-- Cover Generator Modal -->
    <CoverGeneratorModal
      v-if="showCoverGenerator"
      :book="store.book"
      @close="showCoverGenerator = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useBookStore } from '@/stores/bookStore'
import { useStorage } from '@/composables/useStorage'
import EditorContent from '@/components/editor/EditorContent.vue'
import ImportModal from '@/components/common/ImportModal.vue'
import ExportModal from '@/components/common/ExportModal.vue'
import BookPreview from '@/components/viewer/BookPreview.vue'
import CoverGeneratorModal from '@/components/common/CoverGeneratorModal.vue'
import BookStats from '@/components/common/BookStats.vue'

const store = useBookStore()
const { autoSave } = useStorage()

// Modal states
const showImportModal = ref(false)
const showExportModal = ref(false)
const showPreview = ref(false)
const showCoverGenerator = ref(false)

// Auto-save status
const autoSaveStatus = ref('💾 Saved')
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const pages = computed({
  get: () => store.book.pages,
  set: (newPages) => store.reorderPages(newPages),
})

const currentPage = computed(() => store.currentPage)
const currentPageIndex = computed(() => store.book.currentPageIndex)
const totalPages = computed(() => store.book.pages.length)
const bookVersion = computed(() => {
  return new Date(store.book.metadata.updatedAt).toLocaleTimeString()
})

const bookTitle = computed({
  get: () => store.book.metadata.title,
  set: (value) => store.updateBookMetadata({ title: value }),
})

const bookAuthor = computed({
  get: () => store.book.metadata.author,
  set: (value) => store.updateBookMetadata({ author: value }),
})

const pageTitle = computed({
  get: () => currentPage.value?.title || '',
  set: (value) => store.updatePageTitle(value),
})

// Methods
const addPage = () => {
  store.addPage()
  updateSaveStatus('📝 Page added')
}

const deletePage = (pageId: string) => {
  store.deletePage(pageId)
  updateSaveStatus('🗑️ Page deleted')
}

const setCurrentPage = (index: number) => {
  store.setCurrentPage(index)
}

const updateContent = (content: string) => {
  store.updatePageContent(content)
  updateSaveStatus('✏️ Editing...')
}

const updatePageTitle = (title: string) => {
  store.updatePageTitle(title)
  updateSaveStatus('✏️ Editing...')
}

const updateTitle = () => {
  store.updateBookMetadata({ title: bookTitle.value })
  updateSaveStatus('📝 Title updated')
}

const updateAuthor = () => {
  store.updateBookMetadata({ author: bookAuthor.value })
  updateSaveStatus('📝 Author updated')
}

const handleReorder = (newPages: any[]) => {
  store.reorderPages(newPages)
  updateSaveStatus('🔄 Pages reordered')
}

const onBookImported = () => {
  updateSaveStatus('📥 Book imported successfully!')
  store.setCurrentPage(0)
}

const openPreview = () => {
  showPreview.value = true
}

const updateSaveStatus = (status: string) => {
  autoSaveStatus.value = status
  
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(() => {
    autoSaveStatus.value = '💾 Saved'
  }, 2000)
}

// Auto-save setup
let stopAutoSave: (() => void) | null = null

onMounted(() => {
  stopAutoSave = autoSave(store.book)
})

onUnmounted(() => {
  if (stopAutoSave) {
    stopAutoSave()
  }
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
})
</script>