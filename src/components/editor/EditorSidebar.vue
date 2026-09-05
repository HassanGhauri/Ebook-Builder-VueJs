<!-- src/components/editor/EditorSidebar.vue -->
<template>
  <div class="editor-sidebar w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
    <!-- Header with Add Page -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-bold dark:text-white">📄 Pages</h2>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ store.book.pages.length }}
        </span>
      </div>
      <button
        @click="addPage"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
      >
        <span class="text-lg">+</span> Add Page
      </button>
    </div>

    <!-- Pages List with Drag and Drop -->
    <div class="flex-1 overflow-y-auto p-2 min-h-0">
      <!-- Debug info (remove after testing) -->
      <div class="text-xs text-gray-400 dark:text-gray-500 mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
        Pages in store: {{ store.book.pages.length }}
      </div>

      <!-- Empty state -->
      <div v-if="store.book.pages.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-8">
        <div class="text-4xl mb-3">📄</div>
        <p>No pages yet</p>
        <p class="text-sm mt-1">Click "Add Page" to get started</p>
      </div>

      <!-- Pages with drag handle -->
      <div v-else class="space-y-1">
        <div
          v-for="(page, index) in store.book.pages"
          :key="page.id"
          @click="selectPage(index)"
          :class="[
            'p-3 rounded cursor-pointer flex items-center gap-2 transition group',
            store.currentPage?.id === page.id
              ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-500 dark:border-blue-400'
              : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700',
            draggingIndex === index ? 'opacity-50' : ''
          ]"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragend="onDragEnd"
          @dragover.prevent
          @dragenter="onDragEnter(index)"
          @drop="onDrop($event, index)"
        >
          <!-- Drag Handle -->
          <span 
            class="drag-handle cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            @mousedown.stop
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            </svg>
          </span>
          
          <!-- Page Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                {{ index + 1 }}
              </span>
              <input
                :value="page.title"
                @click.stop
                @input="updatePageTitle(page.id, $event)"
                type="text"
                aria-label="Page title"
                placeholder="Untitled"
                class="min-w-0 flex-1 bg-transparent border-none outline-none text-sm dark:text-gray-200 placeholder-gray-400"
              />
              <!-- Active indicator -->
              <span v-if="store.currentPage?.id === page.id" class="text-xs text-blue-500 dark:text-blue-400 flex-shrink-0">
                ●
              </span>
            </div>
            <!-- Page preview snippet -->
            <div class="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {{ getContentPreview(page.content) }}
            </div>
          </div>
          
          <!-- Delete Button -->
          <button
            @click.stop="deletePage(page.id)"
            class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition flex-shrink-0"
            title="Delete page"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Book Metadata & Statistics -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700 overflow-y-auto flex-shrink-0">
      <input
        v-model="bookTitle"
        @input="updateTitle"
        type="text"
        placeholder="Book Title"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm"
      />
      <input
        v-model="bookAuthor"
        @input="updateAuthor"
        type="text"
        placeholder="Author"
        class="w-full px-3 py-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm"
      />
      
      <!-- Book Statistics -->
      <BookStats :book="store.book" class="mt-3" />
      
      <!-- Version -->
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        v{{ bookVersion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import BookStats from '@/components/common/BookStats.vue'

const store = useBookStore()

// Drag state
const draggingIndex = ref<number | null>(null)
const dragStartIndex = ref<number | null>(null)

// Debug - log when component mounts
onMounted(() => {
  console.log('EditorSidebar mounted')
  console.log('Pages in store:', store.book.pages)
  console.log('Page count:', store.book.pages.length)
})

// Watch for changes
watch(
  () => store.book.pages,
  (newPages) => {
    console.log('Pages changed:', newPages)
    console.log('Page count:', newPages.length)
  },
  { deep: true, immediate: true }
)

// Computed
const bookTitle = computed({
  get: () => store.book.metadata.title,
  set: (value) => store.updateBookMetadata({ title: value }),
})

const bookAuthor = computed({
  get: () => store.book.metadata.author,
  set: (value) => store.updateBookMetadata({ author: value }),
})

const bookVersion = computed(() => {
  return new Date(store.book.metadata.updatedAt).toLocaleTimeString()
})

// Drag and Drop Methods
const onDragStart = (event: DragEvent, index: number) => {
  dragStartIndex.value = index
  draggingIndex.value = index
  
  // Store the page id for the drop
  if (event.dataTransfer) {
    const pageId = store.book.pages[index].id
    event.dataTransfer.setData('text/plain', pageId)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDragEnd = () => {
  draggingIndex.value = null
  dragStartIndex.value = null
}

const onDragEnter = (index: number) => {
  if (dragStartIndex.value !== null && dragStartIndex.value !== index) {
    // Visual feedback - we can add a class here if needed
  }
}

const onDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  
  if (dragStartIndex.value === null || dragStartIndex.value === targetIndex) {
    return
  }
  
  const sourceIndex = dragStartIndex.value
  
  // Get the pages array
  const pages = [...store.book.pages]
  
  // Remove the dragged page
  const [draggedPage] = pages.splice(sourceIndex, 1)
  
  // Insert at the target position
  pages.splice(targetIndex, 0, draggedPage)
  
  // Update the store with new order
  store.reorderPages(pages)
  
  // Reset drag state
  draggingIndex.value = null
  dragStartIndex.value = null
}

// Regular Methods
const addPage = () => {
  console.log('Adding page...')
  store.addPage()
  console.log('Pages after add:', store.book.pages)
}

const deletePage = (pageId: string) => {
  if (confirm('Delete this page?')) {
    console.log('Deleting page:', pageId)
    store.deletePage(pageId)
  }
}

const selectPage = (index: number) => {
  console.log('Selecting page:', index)
  store.setCurrentPage(index)
}

const updateTitle = () => {
  store.updateBookMetadata({ title: bookTitle.value })
}

const updateAuthor = () => {
  store.updateBookMetadata({ author: bookAuthor.value })
}

const updatePageTitle = (pageId: string, event: Event) => {
  const input = event.target as HTMLInputElement
  store.updatePageTitleById(pageId, input.value)
}

// Helper to get content preview
const getContentPreview = (content: string): string => {
  if (!content) return 'Empty page'
  const plainText = content.replace(/<[^>]*>/g, ' ').trim()
  const preview = plainText.slice(0, 50)
  return preview + (plainText.length > 50 ? '...' : '')
}
</script>

<style scoped>
.editor-sidebar {
  min-width: 280px;
  max-width: 320px;
}

.editor-sidebar .overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.editor-sidebar .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c4c4c4;
  border-radius: 2px;
}

.editor-sidebar .overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.dark .editor-sidebar .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4a4a4a;
}

/* Drag handle styles */
.drag-handle {
  cursor: grab;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

/* Drag visual feedback */
[draggable="true"] {
  user-select: none;
}

[draggable="true"]:active {
  cursor: grabbing;
}

/* Drop zone visual feedback */
.drag-over {
  border: 2px dashed #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.1) !important;
}

/* Hover effect for delete button */
.group:hover .opacity-0 {
  opacity: 1;
}
</style>