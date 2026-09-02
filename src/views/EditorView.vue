<!-- src/views/EditorView.vue -->
<template>
  <!-- Show entry page if no book is loaded OR if we're on the /editor route (no specific book ID) -->
  <EditorEntry v-if="!isBookLoaded || showEntryPage" />
  
  <!-- Show full editor if book is loaded and we have a specific book ID -->
  <div v-else class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Top Toolbar -->
    <EditorToolbar
      @import="showImportModal = true"
      @export="showExportModal = true"
      @preview="openPreview"
      @cover="showCoverGenerator = true"
    />

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar -->
      <EditorSidebar />

      <!-- Main Editor Area -->
      <div class="flex-1 flex flex-col">
        <!-- Page Header -->
        <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <input
            v-model="pageTitle"
            @input="updatePageTitle"
            type="text"
            placeholder="Page Title"
            class="text-xl font-bold w-full border-none outline-none dark:bg-transparent dark:text-white"
          />
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
    </div>

    <!-- Modals -->
    <ImportModal
      :is-open="showImportModal"
      @close="showImportModal = false"
      @imported="onBookImported"
    />

    <ExportModal
      :is-open="showExportModal"
      @close="showExportModal = false"
    />

    <BookPreview
      v-if="showPreview"
      :book="store.book"
      @close="showPreview = false"
      @export="showExportModal = true"
    />

    <CoverGeneratorModal
      v-if="showCoverGenerator"
      :book="store.book"
      @close="showCoverGenerator = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import { useStorage } from '@/composables/useStorage'
import EditorContent from '@/components/editor/EditorContent.vue'
import EditorToolbar from '@/components/editor/EditorToolbar.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import EditorEntry from '@/components/editor/EditorEntry.vue'
import ImportModal from '@/components/common/ImportModal.vue'
import ExportModal from '@/components/common/ExportModal.vue'
import BookPreview from '@/components/viewer/BookPreview.vue'
import CoverGeneratorModal from '@/components/common/CoverGeneratorModal.vue'

const route = useRoute()
const router = useRouter()
const store = useBookStore()
const { autoSave, loadBook } = useStorage()

// Check if we should show the entry page
// Show entry page if we're on the /editor route (no specific ID)
const showEntryPage = computed(() => {
  // If route is exactly '/editor' or '/editor/' show entry page
  return route.path === '/editor' || route.path === '/editor/'
})

// Check if a book is loaded (has at least one page)
const isBookLoaded = computed(() => {
  return store.book.pages.length > 0
})

// Modal states
const showImportModal = ref(false)
const showExportModal = ref(false)
const showPreview = ref(false)
const showCoverGenerator = ref(false)

// Computed
const currentPage = computed(() => store.currentPage)
const pageTitle = computed({
  get: () => currentPage.value?.title || '',
  set: (value) => store.updatePageTitle(value),
})

// Methods
const updateContent = (content: string) => {
  store.updatePageContent(content)
}

const updatePageTitle = (title: string) => {
  store.updatePageTitle(title)
}

const onBookImported = () => {
  store.setCurrentPage(0)
}

const openPreview = () => {
  showPreview.value = true
}

// Auto-save setup
let stopAutoSave: (() => void) | null = null

const startAutoSave = () => {
  if (!stopAutoSave) {
    stopAutoSave = autoSave(() => store.book)
  }
}

// The editor view can mount before a book is created or loaded.
watch(isBookLoaded, (loaded) => {
  if (loaded) {
    startAutoSave()
  }
})

// Load book from route param if exists (only for /editor/:id)
const loadBookFromRoute = async () => {
  const bookId = route.params.id as string
  if (bookId && bookId !== 'new') {
    const book = await loadBook(bookId)
    if (book) {
      store.loadBookIntoStore(book)
    }
  }
}

onMounted(async () => {
  // Only load from route param if there's an ID (for /editor/:id)
  await loadBookFromRoute()
  
  // Start auto-save immediately when a book was loaded from the route.
  startAutoSave()
})

onUnmounted(() => {
  if (stopAutoSave) {
    stopAutoSave()
  }
})
</script>