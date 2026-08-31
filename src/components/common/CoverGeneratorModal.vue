<!-- src/components/common/CoverGeneratorModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">🎨 Cover Generator</h3>
        <button @click="close" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- Cover Preview -->
      <div class="flex justify-center">
        <div
          class="cover-preview rounded-lg shadow-lg overflow-hidden"
          :style="{
            width: coverWidth + 'px',
            height: coverHeight + 'px',
            backgroundColor: colors[colorIndex],
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '20px',
            margin: '0 auto',
            transition: 'background-color 0.3s ease'
          }"
        >
          <!-- Decorative elements -->
          <div
            class="absolute inset-0 opacity-10"
            :style="{
              backgroundImage: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
            }"
          ></div>
          
          <!-- Title -->
          <h3
            class="text-center font-bold mb-2"
            :style="{
              fontSize: Math.min(28, coverWidth / 10) + 'px',
              color: textColor,
              zIndex: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }"
          >
            {{ bookTitle || 'My Book' }}
          </h3>
          
          <!-- Author -->
          <p
            :style="{
              fontSize: Math.min(14, coverWidth / 20) + 'px',
              color: textColor,
              opacity: 0.8,
              zIndex: 1
            }"
          >
            by {{ bookAuthor || 'Anonymous' }}
          </p>
          
          <!-- Decorative line -->
          <div
            class="w-16 h-0.5 mt-3"
            :style="{
              backgroundColor: textColor,
              opacity: 0.3,
              zIndex: 1
            }"
          ></div>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="mt-6 space-y-3">
        <!-- Color Selection -->
        <div>
          <label class="text-sm font-medium text-gray-700">Color Theme</label>
          <div class="flex flex-wrap gap-2 mt-2">
            <button
              v-for="(color, index) in colors"
              :key="index"
              @click="colorIndex = index"
              class="w-8 h-8 rounded-full border-2 transition"
              :style="{ backgroundColor: color }"
              :class="colorIndex === index ? 'border-blue-500 scale-110' : 'border-transparent'"
            ></button>
          </div>
        </div>

        <!-- Size Controls -->
        <div class="flex space-x-4">
          <div class="flex-1">
            <label class="text-sm font-medium text-gray-700">Width</label>
            <input
              v-model.number="coverWidth"
              type="range"
              min="200"
              max="400"
              class="w-full"
            />
            <span class="text-xs text-gray-500">{{ coverWidth }}px</span>
          </div>
          <div class="flex-1">
            <label class="text-sm font-medium text-gray-700">Height</label>
            <input
              v-model.number="coverHeight"
              type="range"
              min="280"
              max="500"
              class="w-full"
            />
            <span class="text-xs text-gray-500">{{ coverHeight }}px</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <button
            @click="downloadCover"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            💾 Download Cover
          </button>
          <button
            @click="applyCover"
            class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            ✅ Apply to Book
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IBook } from '@/types/book.types'

const props = defineProps<{
  isOpen: boolean
  book: IBook
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// State
const coverWidth = ref(300)
const coverHeight = ref(400)
const colorIndex = ref(0)
const error = ref('')

// Colors
const colors = [
  '#4F46E5', // Indigo
  '#7C3AED', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#D946EF', // Fuchsia
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
]

// Computed
const bookTitle = computed(() => props.book.metadata.title)
const bookAuthor = computed(() => props.book.metadata.author)

const textColor = computed(() => {
  const color = colors[colorIndex.value]
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#1a1a1a' : '#ffffff'
})

// Methods
const close = () => {
  emit('close')
  error.value = ''
}

const downloadCover = async () => {
  const coverElement = document.querySelector('.cover-preview') as HTMLElement
  if (!coverElement) {
    error.value = 'Cover element not found'
    return
  }
  
  try {
    // Dynamic import for html2canvas
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(coverElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: colors[colorIndex.value]
    })
    
    const link = document.createElement('a')
    link.download = `${bookTitle.value || 'book'}-cover.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    error.value = 'Failed to download cover. Please install html2canvas: npm install html2canvas'
    console.error(err)
  }
}

const applyCover = async () => {
  const coverElement = document.querySelector('.cover-preview') as HTMLElement
  if (!coverElement) {
    error.value = 'Cover element not found'
    return
  }
  
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(coverElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: colors[colorIndex.value]
    })
    
    // Store the cover as base64 in the book
    // You'll need to add this to your book store
    // For now, we'll just download it
    const link = document.createElement('a')
    link.download = `${bookTitle.value || 'book'}-cover.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    // Close the modal
    close()
  } catch (err) {
    error.value = 'Failed to apply cover. Please install html2canvas'
    console.error(err)
  }
}
</script>