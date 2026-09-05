<!-- src/components/viewer/BookPreview.vue -->
<template>
  <div class="book-preview-container">
    <!-- Preview Toolbar -->
    <div class="preview-toolbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center space-x-4">
        <button
          @click="closePreview"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          ← Back to Editor
        </button>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ currentPageIndex + 1 }} / {{ totalPages }}
        </span>
      </div>
      
      <div class="flex items-center space-x-3 flex-wrap gap-2">
        <div class="flex items-center space-x-2">
          <button
            @click="decreaseFontSize"
            class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm dark:text-gray-300"
          >
            A-
          </button>
          <span class="text-sm dark:text-gray-300">{{ fontSize }}px</span>
          <button
            @click="increaseFontSize"
            class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm dark:text-gray-300"
          >
            A+
          </button>
        </div>
        
        <button
          @click="toggleTheme"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm dark:text-gray-300"
        >
          {{ currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode' }}
        </button>
        
        <button
          @click="$emit('export')"
          class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          📤 Export
        </button>
      </div>
    </div>

    <div 
      class="preview-content flex-1 overflow-y-auto p-8"
      :style="{ backgroundColor: themeColors[currentTheme].background }"
    >
      <div 
        class="book-view max-w-3xl mx-auto"
        :style="{
          fontSize: fontSize + 'px',
          backgroundColor: themeColors[currentTheme].pageBackground,
          padding: '40px 60px',
          borderRadius: '8px',
          minHeight: '500px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease'
        }"
      >
        <!-- Book Title -->
        <div class="text-center mb-12">
          <h1 
            class="text-4xl font-bold mb-2"
            :style="{ 
              color: themeColors[currentTheme].heading,
            }"
          >
            {{ book.metadata.title }}
          </h1>
          <p class="text-lg" :style="{ 
            color: themeColors[currentTheme].subtext,
          }">
            By {{ book.metadata.author }}
          </p>
          <div class="mt-4" :style="{ borderColor: themeColors[currentTheme].divider }">
            <hr>
          </div>
        </div>

        <div v-if="currentPage" class="page-content">
          <h2 
            class="text-2xl font-bold mb-6 pb-2 border-b"
            :style="{ 
              color: themeColors[currentTheme].heading,
              borderColor: themeColors[currentTheme].divider,
            }"
          >
            {{ currentPage.title }}
          </h2>
          <div 
            class="prose max-w-none"
            :style="{ 
              lineHeight: '1.8'
            }"
            v-html="processedContent"
          ></div>
        </div>

        <div class="mt-12 pt-6 border-t flex justify-between items-center" :style="{ borderColor: themeColors[currentTheme].divider }">
          <button
            @click="previousPage"
            :disabled="currentPageIndex === 0"
            class="px-4 py-2 rounded transition disabled:opacity-50"
            :style="{
              backgroundColor: themeColors[currentTheme].buttonBg,
              color: themeColors[currentTheme].buttonText,
            }"
            @mouseenter="hoverButton($event, true)"
            @mouseleave="hoverButton($event, false)"
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
            :style="{
              backgroundColor: themeColors[currentTheme].buttonBg,
              color: themeColors[currentTheme].buttonText,
            }"
            @mouseenter="hoverButton($event, true)"
            @mouseleave="hoverButton($event, false)"
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
import type { IBook } from '@/types/book.types'

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
const currentTheme = ref<'light' | 'dark'>('light')

// Theme colors
const themeColors = {
  light: {
    background: '#f0f0f0',
    pageBackground: '#ffffff',
    text: '#1a1a1a',
    heading: '#0a0a0a',
    subtext: '#666666',
    divider: '#e5e5e5',
    buttonBg: '#f3f4f6',
    buttonText: '#1a1a1a',
    buttonHoverBg: '#e5e7eb',
  },
  dark: {
    background: '#1a1a1a',
    pageBackground: '#ffffff',
    text: '#1a1a1a',
    heading: '#0a0a0a',
    subtext: '#666666',
    divider: '#e5e5e5',
    buttonBg: '#e5e7eb',
    buttonText: '#1a1a1a',
    buttonHoverBg: '#d1d5db',
  }
}

// Computed
const totalPages = computed(() => props.book.pages.length)
const currentPage = computed(() => props.book.pages[currentPageIndex.value])

// Remove editor-only color and highlight marks from stored content before previewing.
const processedContent = computed(() => {
  if (!currentPage.value) return ''

  const document = new DOMParser().parseFromString(currentPage.value.content, 'text/html')
  document.querySelectorAll('*').forEach((element) => {
    const styledElement = element as HTMLElement
    styledElement.style.removeProperty('color')
    styledElement.style.removeProperty('background-color')
    styledElement.style.removeProperty('background')
    styledElement.removeAttribute('data-color')

    if (styledElement.tagName === 'MARK' || (styledElement.tagName === 'SPAN' && !styledElement.attributes.length)) {
      styledElement.replaceWith(...Array.from(styledElement.childNodes))
    }
  })

  const defaultColor = themeColors[currentTheme.value].text

  return `
    <div class="preview-content-wrapper" style="color: ${defaultColor};">
      ${document.body.innerHTML}
    </div>
  `
})

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
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
}

const hoverButton = (event: MouseEvent, isHover: boolean) => {
  const target = event.target as HTMLButtonElement
  if (isHover && !target.disabled) {
    target.style.backgroundColor = themeColors[currentTheme.value].buttonHoverBg
  } else if (!isHover) {
    target.style.backgroundColor = themeColors[currentTheme.value].buttonBg
  }
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

// Lifecycle
import { onMounted, onUnmounted } from 'vue'

watch(() => props.book, () => {
  currentPageIndex.value = 0
}, { immediate: true })

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
  transition: background-color 0.3s ease;
}

.book-view {
  transition: background-color 0.3s ease;
}

/* ============================================
   Preview Content Styles - Preserve custom colors
   ============================================ */

/* The wrapper div sets default color, but doesn't force it with !important */
.preview-content-wrapper {
  color: inherit; /* Inherits from parent */
}

/* Allow inline styles to override the default color */
.preview-content-wrapper * {
  /* No forced color here - let inline styles work */
}

/* Override for links - keep them blue for visibility */
.preview-content-wrapper a {
  color: #3b82f6 !important;
  text-decoration: underline;
}

.preview-content-wrapper a:hover {
  color: #2563eb !important;
}

/* v-html content needs deep selectors because Vue cannot scope its nodes. */
:deep(.preview-content-wrapper h1) {
  margin: 0 0 1rem;
  font-size: 2em;
  line-height: 1.2;
  font-weight: 700;
}

:deep(.preview-content-wrapper h2) {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.5em;
  line-height: 1.3;
  font-weight: 700;
}

:deep(.preview-content-wrapper h3) {
  margin: 1.25rem 0 0.5rem;
  font-size: 1.25em;
  line-height: 1.4;
  font-weight: 700;
}

/* Paragraphs */
.preview-content-wrapper p {
  margin: 0 0 1rem;
  line-height: 1.8;
}

/* Lists */
.preview-content-wrapper ul,
.preview-content-wrapper ol {
  margin: 0 0 1rem 1.5rem;
}

.preview-content-wrapper li {
  margin: 0 0 0.5rem;
}

/* Blockquotes */
.preview-content-wrapper blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}

/* Code blocks */
.preview-content-wrapper code {
  font-family: monospace;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background-color: rgba(128, 128, 128, 0.15);
}

.preview-content-wrapper pre {
  padding: 1rem;
  border-radius: 4px;
  background-color: rgba(128, 128, 128, 0.1);
  overflow-x: auto;
}

.preview-content-wrapper pre code {
  background: transparent;
  padding: 0;
}

/* Images */
.preview-content-wrapper img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 4px;
}

/* Horizontal rule */
.preview-content-wrapper hr {
  margin: 2rem 0;
  border: none;
  border-top: 2px solid #e5e5e5;
}

/* Tables */
.preview-content-wrapper table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.preview-content-wrapper th,
.preview-content-wrapper td {
  padding: 0.5rem;
  border: 1px solid #e5e5e5;
}

.preview-content-wrapper th {
  font-weight: 700;
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

.dark .preview-content::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.dark .preview-content::-webkit-scrollbar-thumb {
  background: #555;
}

.dark .preview-content::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>