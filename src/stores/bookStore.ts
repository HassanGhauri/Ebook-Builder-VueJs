// src/stores/bookStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IBook, IPage, IMetadata } from '@/types/book.types'

export const useBookStore = defineStore('book', () => {
  // State - Start with empty pages
  const book = ref<IBook>({
    id: crypto.randomUUID(),
    metadata: {
      title: 'My New Book',
      author: 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    pages: [],
    currentPageIndex: 0,
  })

  // Track the current book ID for "Continue Editing"
  const currentBookId = ref<string | null>(null)

  // Getters
  const currentPage = computed(() => {
    return book.value.pages[book.value.currentPageIndex] || null
  })

  const totalPages = computed(() => book.value.pages.length)

  // Actions
  function addPage() {
    const newPage: IPage = {
      id: crypto.randomUUID(),
      title: `Page ${book.value.pages.length + 1}`,
      content: '<p>New page content...</p>',
      order: book.value.pages.length,
    }
    book.value.pages.push(newPage)
    book.value.currentPageIndex = book.value.pages.length - 1
    updateTimestamp()
  }

  function deletePage(pageId: string) {
    const index = book.value.pages.findIndex((p) => p.id === pageId)
    if (index > -1) {
      book.value.pages.splice(index, 1)
      book.value.pages.forEach((page, i) => (page.order = i))
      if (book.value.currentPageIndex >= book.value.pages.length) {
        book.value.currentPageIndex = Math.max(0, book.value.pages.length - 1)
      }
      updateTimestamp()
    }
  }

  function setCurrentPage(index: number) {
    if (index >= 0 && index < book.value.pages.length) {
      book.value.currentPageIndex = index
    }
  }

  function updatePageContent(content: string) {
    if (currentPage.value) {
      currentPage.value.content = content
      updateTimestamp()
    }
  }

  function updatePageTitle(title: string) {
    if (currentPage.value) {
      currentPage.value.title = title
      updateTimestamp()
    }
  }

  function updatePageTitleById(pageId: string, title: string) {
    const page = book.value.pages.find((item) => item.id === pageId)
    if (page) {
      page.title = title
      updateTimestamp()
    }
  }

  function updateBookMetadata(metadata: Partial<IMetadata>) {
    Object.assign(book.value.metadata, metadata)
    updateTimestamp()
  }

  function reorderPages(newPages: IPage[]) {
    book.value.pages = newPages
    book.value.pages.forEach((page, index) => (page.order = index))
    updateTimestamp()
  }

  function updateTimestamp() {
    book.value.metadata.updatedAt = new Date().toISOString()
  }

  // Set the current book ID
  function setCurrentBookId(id: string) {
    currentBookId.value = id
  }

  // Reset method - creates a new empty book
  function $reset() {
    const newId = crypto.randomUUID()
    book.value = {
      id: newId,
      metadata: {
        title: 'My New Book',
        author: 'Anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      pages: [],
      currentPageIndex: 0,
    }
    currentBookId.value = newId
  }

  // Load a book into the store
  function loadBookIntoStore(loadedBook: IBook) {
    book.value = loadedBook
    currentBookId.value = loadedBook.id
  }

  // Check if there's a book in progress (has pages)
  function hasBookInProgress(): boolean {
    return book.value.pages.length > 0
  }

  // Get the current book title
  function getCurrentBookTitle(): string {
    return book.value.metadata.title || 'Untitled Book'
  }

  return {
    book,
    currentPage,
    totalPages,
    currentBookId,
    addPage,
    deletePage,
    setCurrentPage,
    updatePageContent,
    updatePageTitle,
    updatePageTitleById,
    updateBookMetadata,
    reorderPages,
    setCurrentBookId,
    loadBookIntoStore,
    hasBookInProgress,
    getCurrentBookTitle,
    $reset,
  }
})
