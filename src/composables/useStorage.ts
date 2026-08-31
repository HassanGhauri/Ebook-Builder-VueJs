// src/composables/useStorage.ts
import { ref, watch, onMounted } from 'vue'
import Dexie from 'dexie'
import type { IBook } from '@/types/book.types'

// Setup Dexie database
const db = new Dexie('EbookBuilderDB')
db.version(1).stores({
  books: 'id, metadata.title, metadata.updatedAt',
})

export function useStorage() {
  const isLoaded = ref(false)
  const currentBookId = ref<string | null>(null)

  /**
   * Clean the book object to make it serializable for IndexedDB
   * This removes Vue reactivity and ensures only plain data is stored
   */
  function sanitizeBook(book: IBook): IBook {
    // Create a clean copy with only the data we need
    return {
      id: book.id || crypto.randomUUID(),
      metadata: {
        title: book.metadata?.title || 'My Book',
        author: book.metadata?.author || 'Anonymous',
        createdAt: book.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      pages:
        book.pages?.map((page) => ({
          id: page.id || crypto.randomUUID(),
          title: page.title || 'Untitled Page',
          content: page.content || '<p>Start writing...</p>',
          order: page.order || 0,
        })) || [],
      currentPageIndex: book.currentPageIndex || 0,
      coverImage: book.coverImage || undefined,
    }
  }

  // Load book from IndexedDB
  async function loadBook(bookId: string): Promise<IBook | null> {
    try {
      const book = await db.table('books').get(bookId)
      return book || null
    } catch (error) {
      console.error('Failed to load book:', error)
      return null
    }
  }

  // Save book to IndexedDB
  async function saveBook(book: IBook): Promise<void> {
    try {
      // Sanitize the book data before saving
      const cleanBook = sanitizeBook(book)

      // Store the clean version
      await db.table('books').put(cleanBook)
      currentBookId.value = cleanBook.id

      console.log('Book saved successfully:', cleanBook.metadata.title)
    } catch (error) {
      console.error('Failed to save book:', error)
      throw error
    }
  }

  // Load all books (for library view)
  async function getAllBooks(): Promise<IBook[]> {
    try {
      return await db.table('books').toArray()
    } catch (error) {
      console.error('Failed to load all books:', error)
      return []
    }
  }

  // Delete a book
  async function deleteBook(bookId: string): Promise<void> {
    try {
      await db.table('books').delete(bookId)
    } catch (error) {
      console.error('Failed to delete book:', error)
    }
  }

  // Auto-save watcher with proper debouncing
  function autoSave(book: any) {
    let saveTimeout: ReturnType<typeof setTimeout> | null = null
    let isSaving = false

    return watch(
      book,
      async (newBook) => {
        // Clear existing timeout
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }

        // Debounce save by 2 seconds
        saveTimeout = setTimeout(async () => {
          if (isSaving) return

          isSaving = true
          try {
            // Convert Vue proxy to plain object
            const plainBook = JSON.parse(JSON.stringify(newBook))
            await saveBook(plainBook)
          } catch (error) {
            console.error('Auto-save failed:', error)
          } finally {
            isSaving = false
          }
        }, 2000)
      },
      { deep: true },
    )
  }

  return {
    isLoaded,
    currentBookId,
    loadBook,
    saveBook,
    getAllBooks,
    deleteBook,
    autoSave,
  }
}
