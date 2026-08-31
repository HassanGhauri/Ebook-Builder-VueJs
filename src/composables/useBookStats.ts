// src/composables/useBookStats.ts
import { computed, ref, watch } from 'vue'
import type { IBook } from '@/types/book.types'

export function useBookStats(book: IBook) {
  // Statistics state
  const stats = ref({
    totalWords: 0,
    totalCharacters: 0,
    totalPages: 0,
    readingTimeMinutes: 0,
    readingTimeFormatted: '0 min',
    wordsPerPage: 0,
    charactersPerPage: 0,
  })

  // Calculate statistics from book content
  const calculateStats = () => {
    if (!book || !book.pages || book.pages.length === 0) {
      return {
        totalWords: 0,
        totalCharacters: 0,
        totalPages: 0,
        readingTimeMinutes: 0,
        readingTimeFormatted: '0 min',
        wordsPerPage: 0,
        charactersPerPage: 0,
      }
    }

    let totalWords = 0
    let totalCharacters = 0

    // Process each page
    book.pages.forEach((page) => {
      // Strip HTML tags to get plain text
      const plainText = page.content.replace(/<[^>]*>/g, ' ').trim()

      // Count words (split by spaces and filter empty)
      const words = plainText.split(/\s+/).filter((word) => word.length > 0)
      totalWords += words.length

      // Count characters (excluding spaces)
      totalCharacters += plainText.replace(/\s/g, '').length
    })

    const totalPages = book.pages.length
    const wordsPerPage = totalPages > 0 ? Math.round(totalWords / totalPages) : 0
    const charactersPerPage = totalPages > 0 ? Math.round(totalCharacters / totalPages) : 0

    // Reading time: Average reading speed is 200-250 words per minute
    const readingTimeMinutes = Math.round(totalWords / 200)
    const readingTimeFormatted = formatReadingTime(readingTimeMinutes)

    return {
      totalWords,
      totalCharacters,
      totalPages,
      readingTimeMinutes,
      readingTimeFormatted,
      wordsPerPage,
      charactersPerPage,
    }
  }

  // Format reading time
  const formatReadingTime = (minutes: number): string => {
    if (minutes < 1) return 'Less than 1 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`
  }

  // Update stats whenever book changes
  const updateStats = () => {
    stats.value = calculateStats()
  }

  // Watch for changes
  watch(
    () => book,
    () => {
      updateStats()
    },
    { deep: true },
  )

  // Initial calculation
  updateStats()

  return {
    stats,
    updateStats,
    // Individual getters for convenience
    totalWords: computed(() => stats.value.totalWords),
    totalCharacters: computed(() => stats.value.totalCharacters),
    totalPages: computed(() => stats.value.totalPages),
    readingTime: computed(() => stats.value.readingTimeFormatted),
    wordsPerPage: computed(() => stats.value.wordsPerPage),
    charactersPerPage: computed(() => stats.value.charactersPerPage),
  }
}
