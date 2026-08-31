<!-- src/components/common/BookStats.vue -->
<template>
  <div class="book-stats bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
      <span class="mr-2">📊</span> Book Statistics
    </h4>
    
    <div class="grid grid-cols-2 gap-3">
      <!-- Total Words -->
      <div class="stat-item">
        <div class="stat-value text-lg font-bold text-blue-600 dark:text-blue-400">
          {{ formatNumber(stats.totalWords) }}
        </div>
        <div class="stat-label text-xs text-gray-500 dark:text-gray-400">Words</div>
      </div>

      <!-- Total Pages -->
      <div class="stat-item">
        <div class="stat-value text-lg font-bold text-purple-600 dark:text-purple-400">
          {{ stats.totalPages }}
        </div>
        <div class="stat-label text-xs text-gray-500 dark:text-gray-400">Pages</div>
      </div>

      <!-- Reading Time -->
      <div class="stat-item">
        <div class="stat-value text-lg font-bold text-green-600 dark:text-green-400">
          {{ stats.readingTimeFormatted }}
        </div>
        <div class="stat-label text-xs text-gray-500 dark:text-gray-400">Reading Time</div>
      </div>

      <!-- Characters -->
      <div class="stat-item">
        <div class="stat-value text-lg font-bold text-orange-600 dark:text-orange-400">
          {{ formatNumber(stats.totalCharacters) }}
        </div>
        <div class="stat-label text-xs text-gray-500 dark:text-gray-400">Characters</div>
      </div>
    </div>

    <!-- Additional Stats (Optional) -->
    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>Avg: {{ stats.wordsPerPage }} words/page</span>
      <span>{{ stats.charactersPerPage }} chars/page</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookStats } from '@/composables/useBookStats'
import type { IBook } from '@/types/book.types'

const props = defineProps<{
  book: IBook
}>()

// Use the stats composable
const { stats } = useBookStats(props.book)

// Helper to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<style scoped>
.stat-item {
  @apply text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50;
}

.stat-value {
  @apply font-mono;
}

/* Animation for number changes */
.stat-value {
  transition: all 0.3s ease;
}
</style>