// src/composables/useStorage.ts
import { ref, watch } from 'vue'
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
   */
  function sanitizeBook(book: IBook): IBook {
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

  // Get the most recently updated book
  async function getLatestBook(): Promise<IBook | null> {
    try {
      const books = await db.table('books').toArray()
      if (books.length === 0) return null

      // Sort by updatedAt descending (most recent first)
      const sorted = books.sort(
        (a, b) =>
          new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime(),
      )
      return sorted[0]
    } catch (error) {
      console.error('Failed to get latest book:', error)
      return null
    }
  }

  // Save book to IndexedDB
  async function saveBook(book: IBook): Promise<void> {
    try {
      const cleanBook = sanitizeBook(book)
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

  // Auto-save watcher
  function autoSave(book: any) {
    let saveTimeout: ReturnType<typeof setTimeout> | null = null
    let isSaving = false

    return watch(
      book,
      async (newBook) => {
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }

        saveTimeout = setTimeout(async () => {
          if (isSaving) return

          isSaving = true
          try {
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
    getLatestBook,
    saveBook,
    getAllBooks,
    deleteBook,
    autoSave,
  }
}
