<!-- src/components/editor/EditorEntry.vue -->
<template>
  <div class="editor-entry min-h-[calc(100vh-8rem)] flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-4xl w-full">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="text-6xl mb-4">🌙</div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Crescent Books
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Start your writing journey today
        </p>
      </div>

      <!-- Options Grid -->
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Continue Editing - Only shown if there's a book in progress -->
        <div
          v-if="hasBookInProgress"
          @click="continueEditing"
          class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-emerald-500 hover:border-emerald-600"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="p-8 text-center relative">
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📖</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Continue Editing
            </h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              "{{ bookTitle }}" — Pick up where you left off
            </p>
            <div class="mt-4 inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
              Continue →
            </div>
          </div>
        </div>

        <!-- Create New Book -->
        <div
          @click="createNewBook"
          :class="[
            'group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-emerald-500',
            !hasBookInProgress ? 'md:col-start-2' : ''
          ]"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="p-8 text-center relative">
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📝</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Book
            </h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Start from scratch and build your book page by page
            </p>
            <div class="mt-4 inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
              Get Started →
            </div>
          </div>
        </div>

        <!-- Import Book -->
        <div
          @click="triggerImport"
          class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-emerald-500"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="p-8 text-center relative">
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📥</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Import Book
            </h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Import existing files (DOCX, TXT) and continue editing
            </p>
            <div class="mt-4 inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
              Import File →
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        accept=".docx,.txt"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Footer Text -->
      <div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-500">
        <p>Your books are saved locally in your browser. No data is sent to any server.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import { useImport } from '@/composables/useImport'
import { useStorage } from '@/composables/useStorage'

const router = useRouter()
const store = useBookStore()
const { importFromDOCX, importFromText } = useImport()
const { getLatestBook, saveBook } = useStorage()
const fileInput = ref<HTMLInputElement | null>(null)

// Check if there's a book in progress (has pages)
const hasBookInProgress = computed(() => {
  return store.book.pages.length > 0
})

// Get the book title for display
const bookTitle = computed(() => {
  return store.book.metadata.title || 'Untitled Book'
})

const createNewBook = () => {
  // Reset the store to a new empty book
  store.$reset()
  // Add a default first page so the editor shows
  store.addPage()
  // Save the new book immediately so it's tracked
  saveBook(store.book)
  // Navigate to editor with a new book
  router.push('/editor/new')
}

const continueEditing = () => {
  // Navigate to the editor - the book is already loaded
  router.push('/editor/new')
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return

  try {
    let importedBook: any
    
    if (file.name.endsWith('.docx')) {
      importedBook = await importFromDOCX(file)
    } else if (file.name.endsWith('.txt')) {
      importedBook = await importFromText(file)
    } else {
      alert('Unsupported file format. Please use .docx or .txt')
      return
    }

    // Reset the store first
    store.$reset()
    
    // Update the store with imported data
    if (importedBook.metadata) {
      store.book.metadata = {
        ...store.book.metadata,
        ...importedBook.metadata,
        updatedAt: new Date().toISOString(),
      }
    }
    
    if (importedBook.pages && importedBook.pages.length > 0) {
      store.book.pages = importedBook.pages
      store.book.currentPageIndex = 0
      store.book.metadata.updatedAt = new Date().toISOString()
    } else {
      store.addPage()
    }

    // Save the imported book
    await saveBook(store.book)

    // Navigate to editor
    router.push('/editor/new')
    
    // Reset file input
    input.value = ''
  } catch (error) {
    console.error('Import failed:', error)
    alert('Failed to import file. Please try again.')
  }
}

// Load the most recent book when component mounts
onMounted(async () => {
  try {
    const latestBook = await getLatestBook()
    if (latestBook && latestBook.pages.length > 0) {
      // Load the book into the store
      store.loadBookIntoStore(latestBook)
      console.log('Loaded latest book for continue editing:', latestBook.metadata.title)
    } else {
      // No book with pages found, reset
      store.$reset()
    }
  } catch (error) {
    console.error('Failed to load latest book:', error)
    store.$reset()
  }
})
</script>

<style scoped>
.editor-entry {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:translate-x-1 {
  transform: translateX(4px);
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>