<!-- src/components/viewer/BookPreview.vue -->
<template>
  <div class="book-preview-container">
    <!-- Preview Toolbar -->
    <div class="preview-toolbar bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="closePreview"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          ← Back to Editor
        </button>
        <span class="text-sm text-gray-500">
          {{ currentPageIndex + 1 }} / {{ totalPages }}
        </span>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- Font Size Controls -->
        <div class="flex items-center space-x-2">
          <button
            @click="decreaseFontSize"
            class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            A-
          </button>
          <span class="text-sm">{{ fontSize }}px</span>
          <button
            @click="increaseFontSize"
            class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            A+
          </button>
        </div>
        
        <!-- Theme Controls -->
        <button
          @click="toggleTheme"
          class="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
        >
          {{ currentTheme === 'light' ? '🌙 Dark' : '☀️ Light' }}
        </button>
        
        <!-- Export Button -->
        <button
          @click="$emit('export')"
          class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          📤 Export
        </button>
      </div>
    </div>

    <!-- Book Content -->
    <div class="preview-content flex-1 overflow-y-auto p-8">
      <div 
        class="book-view max-w-3xl mx-auto"
        :style="{
          fontSize: fontSize + 'px',
          backgroundColor: themeColors[currentTheme].background,
          color: themeColors[currentTheme].text,
          padding: '40px 60px',
          borderRadius: '8px',
          minHeight: '500px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s, color 0.3s'
        }"
      >
        <!-- Book Title -->
        <div class="text-center mb-12">
          <h1 
            class="text-4xl font-bold mb-2"
            :style="{ color: themeColors[currentTheme].heading }"
          >
            {{ book.metadata.title }}
          </h1>
          <p class="text-lg" :style="{ color: themeColors[currentTheme].subtext }">
            By {{ book.metadata.author }}
          </p>
          <div class="mt-4" :style="{ borderColor: themeColors[currentTheme].divider }">
            <hr>
          </div>
        </div>

        <!-- Page Content -->
        <div v-if="currentPage" class="page-content">
          <h2 
            class="text-2xl font-bold mb-6 pb-2 border-b"
            :style="{ 
              color: themeColors[currentTheme].heading,
              borderColor: themeColors[currentTheme].divider 
            }"
          >
            {{ currentPage.title }}
          </h2>
          <div 
            class="prose max-w-none"
            :style="{ 
              color: themeColors[currentTheme].text,
              lineHeight: '1.8'
            }"
            v-html="currentPage.content"
          ></div>
        </div>

        <!-- Page Navigation -->
        <div class="mt-12 pt-6 border-t flex justify-between items-center">
          <button
            @click="previousPage"
            :disabled="currentPageIndex === 0"
            class="px-4 py-2 rounded transition disabled:opacity-50"
            :class="[
              currentTheme === 'light' 
                ? 'bg-gray-100 hover:bg-gray-200' 
                : 'bg-gray-700 hover:bg-gray-600'
            ]"
          >
            ← Previous
          </button>
          <span class="text-sm" :style="{ color: themeColors[currentTheme].subtext }">
            Page {{ currentPageIndex + 1 }} of {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPageIndex === totalPages - 1"
            class="px-4 py-2 rounded transition disabled:opacity-50"
            :class="[
              currentTheme === 'light' 
                ? 'bg-gray-100 hover:bg-gray-200' 
                : 'bg-gray-700 hover:bg-gray-600'
            ]"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { IBook, IPage } from '@/types/book.types'

const props = defineProps<{
  book: IBook
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'export'): void
}>()

// State
const currentPageIndex = ref(0)
const fontSize = ref(18)
const currentTheme = ref<'light' | 'sepia' | 'dark'>('light')

// Theme colors
const themeColors = {
  light: {
    background: '#ffffff',
    text: '#333333',
    heading: '#1a1a1a',
    subtext: '#666666',
    divider: '#e5e5e5',
  },
  sepia: {
    background: '#f9f4e8',
    text: '#5b4637',
    heading: '#3c2a1f',
    subtext: '#8a7a6a',
    divider: '#d4c9b8',
  },
  dark: {
    background: '#1a1a1a',
    text: '#e0e0e0',
    heading: '#ffffff',
    subtext: '#999999',
    divider: '#333333',
  }
}

// Computed
const totalPages = computed(() => props.book.pages.length)
const currentPage = computed(() => props.book.pages[currentPageIndex.value])

// Methods
const nextPage = () => {
  if (currentPageIndex.value < totalPages.value - 1) {
    currentPageIndex.value++
  }
}

const previousPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--
  }
}

const closePreview = () => {
  emit('close')
}

const increaseFontSize = () => {
  if (fontSize.value < 28) {
    fontSize.value += 2
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
  }
}

const toggleTheme = () => {
  const themes: ('light' | 'sepia' | 'dark')[] = ['light', 'sepia', 'dark']
  const currentIndex = themes.indexOf(currentTheme.value)
  currentTheme.value = themes[(currentIndex + 1) % themes.length]
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextPage()
    event.preventDefault()
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    previousPage()
    event.preventDefault()
  } else if (event.key === 'Escape') {
    closePreview()
    event.preventDefault()
  }
}

// Add/remove keyboard listener
watch(() => props.book, () => {
  // Reset to first page when book changes
  currentPageIndex.value = 0
}, { immediate: true })

// Lifecycle
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.book-preview-container {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.book-view {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Prose styles for content */
.book-view :deep(h1) {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
}

.book-view :deep(h2) {
  font-size: 2rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
}

.book-view :deep(h3) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.25rem 0 0.75rem;
}

.book-view :deep(p) {
  margin: 0 0 1rem;
  line-height: 1.8;
}

.book-view :deep(ul) {
  margin: 0 0 1rem 1.5rem;
  list-style-type: disc;
}

.book-view :deep(ol) {
  margin: 0 0 1rem 1.5rem;
  list-style-type: decimal;
}

.book-view :deep(li) {
  margin: 0 0 0.5rem;
}

.book-view :deep(blockquote) {
  border-left: 4px solid #ccc;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}

.book-view :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 4px;
}

.book-view :deep(hr) {
  margin: 2rem 0;
  border: none;
  border-top: 2px solid #e5e5e5;
}

/* Button transitions */
.book-view button {
  transition: all 0.2s ease;
}

/* Scrollbar styling */
.preview-content::-webkit-scrollbar {
  width: 8px;
}

.preview-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.preview-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.preview-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>