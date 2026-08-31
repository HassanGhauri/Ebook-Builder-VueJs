<!-- src/components/common/CoverGenerator.vue -->
<template>
  <div class="cover-generator">
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
        margin: '0 auto'
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
    
    <!-- Controls -->
    <div class="mt-4 flex justify-center space-x-2">
      <button
        @click="changeColor"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
      >
        🎨 Change Color
      </button>
      <button
        @click="downloadCover"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        💾 Download Cover
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookStore } from '@/stores/bookStore'

const props = defineProps<{
  width?: number
  height?: number
}>()

const store = useBookStore()
const coverWidth = ref(props.width || 300)
const coverHeight = ref(props.height || 400)
const colorIndex = ref(0)

const bookTitle = computed(() => store.book.metadata.title)
const bookAuthor = computed(() => store.book.metadata.author)

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
]

const textColor = computed(() => {
  // Simple contrast check - if color is dark, use white, else black
  const color = colors[colorIndex.value]
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#1a1a1a' : '#ffffff'
})

const changeColor = () => {
  colorIndex.value = (colorIndex.value + 1) % colors.length
}

const downloadCover = async () => {
  const coverElement = document.querySelector('.cover-preview') as HTMLElement
  if (!coverElement) return
  
  // Use html2canvas if installed, or simple approach
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(coverElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: colors[colorIndex.value]
    })
    
    const link = document.createElement('a')
    link.download = `${bookTitle.value}-cover.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('Failed to download cover:', error)
    alert('Please install html2canvas: npm install html2canvas')
  }
}
</script>