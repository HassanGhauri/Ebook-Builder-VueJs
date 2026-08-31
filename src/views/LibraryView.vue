<!-- src/views/LibraryView.vue -->
<template>
  <div class="min-h-[calc(100vh-8rem)] p-8 bg-gray-100 dark:bg-gray-900">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <div class="flex items-center space-x-3">
            <span class="text-4xl">🌙</span>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Library</h1>
              <p class="text-gray-600 dark:text-gray-400 mt-1">All your saved books in one place</p>
            </div>
          </div>
        </div>
        <button
          @click="createNewBook"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          + New Book
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search books..."
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading your library...</p>
      </div>

      <!-- Books Grid -->
      <div v-else-if="filteredBooks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="book in filteredBooks"
          :key="book.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
        >
          <!-- Book Cover -->
          <div
            class="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white relative"
          >
            <!-- Decorative crescent -->
            <span class="absolute top-2 right-2 text-6xl opacity-20">🌙</span>
            <div class="text-center p-4 relative z-10">
              <h3 class="text-xl font-bold truncate">{{ book.metadata.title }}</h3>
              <p class="text-sm opacity-80">by {{ book.metadata.author }}</p>
              <span class="text-xs bg-black/20 px-2 py-1 rounded-full mt-2 inline-block">
                {{ book.pages.length }} pages
              </span>
            </div>
          </div>
          
          <!-- Book Info -->
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Updated: {{ new Date(book.metadata.updatedAt).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <!-- Book Statistics -->
            <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>📝 {{ getWordCount(book) }} words</span>
                <span>⏱️ {{ getReadingTime(book) }}</span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex space-x-2 mt-3">
              <button
                @click="openBook(book.id)"
                class="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition"
              >
                📖 Open
              </button>
              <button
                @click="deleteBook(book.id)"
                class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="text-6xl mb-4">📖</div>
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300">No books found</h3>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          {{ searchQuery ? 'Try a different search term' : 'Create your first book to get started!' }}
        </p>
        <button
          v-if="!searchQuery"
          @click="createNewBook"
          class="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Create New Book
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/composables/useStorage'
import { useBookStore } from '@/stores/bookStore'
import type { IBook } from '@/types/book.types'

const router = useRouter()
const store = useBookStore()
const { getAllBooks, deleteBook: deleteBookFromDB } = useStorage()

// State
const books = ref<IBook[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

// Computed
const filteredBooks = computed(() => {
  if (!searchQuery.value) return books.value
  const query = searchQuery.value.toLowerCase()
  return books.value.filter(book => 
    book.metadata.title.toLowerCase().includes(query) ||
    book.metadata.author.toLowerCase().includes(query)
  )
})

// Helper functions for statistics
const getWordCount = (book: IBook): number => {
  let total = 0
  book.pages.forEach(page => {
    const plainText = page.content.replace(/<[^>]*>/g, ' ').trim()
    total += plainText.split(/\s+/).filter(word => word.length > 0).length
  })
  return total
}

const getReadingTime = (book: IBook): string => {
  const words = getWordCount(book)
  const minutes = Math.round(words / 200)
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}m`
}

// Methods
const loadBooks = async () => {
  isLoading.value = true
  try {
    books.value = await getAllBooks()
  } catch (error) {
    console.error('Failed to load books:', error)
  } finally {
    isLoading.value = false
  }
}

const openBook = (bookId: string) => {
  router.push(`/editor/${bookId}`)
}

const deleteBook = async (bookId: string) => {
  if (confirm('Are you sure you want to delete this book?')) {
    try {
      await deleteBookFromDB(bookId)
      books.value = books.value.filter(book => book.id !== bookId)
    } catch (error) {
      console.error('Failed to delete book:', error)
    }
  }
}

const createNewBook = () => {
  router.push('/editor')
}

// Lifecycle
onMounted(() => {
  loadBooks()
})
</script>