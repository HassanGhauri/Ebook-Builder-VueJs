<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-3 cursor-pointer" @click="goHome">
          <span class="text-3xl">🌙</span>
          <div>
            <h1 class="text-xl font-bold tracking-tight">Crescent Books</h1>
            <p class="text-xs text-emerald-200 hidden sm:block">Ebook Builder</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link 
            to="/" 
            class="text-emerald-100 hover:text-white transition px-3 py-2 rounded-md text-sm font-medium no-underline"
            active-class="bg-white/20 text-white"
            exact-active-class="bg-white/20 text-white"
          >
            📚 Library
          </router-link>
          <router-link 
            to="/editor" 
            class="text-emerald-100 hover:text-white transition px-3 py-2 rounded-md text-sm font-medium no-underline"
            active-class="bg-white/20 text-white"
            exact-active-class="bg-white/20 text-white"
          >
            ✍️ New Book
          </router-link>
        </nav>

        <!-- Right Side Actions -->
        <div class="flex items-center space-x-4">
          <button
            @click="toggleTheme"
            class="p-2 rounded-full hover:bg-white/20 transition"
            title="Toggle theme"
          >
            <span v-if="isDarkMode" class="text-xl">☀️</span>
            <span v-else class="text-xl">🌙</span>
          </button>

          <div class="flex items-center space-x-3">
            <span class="text-sm text-emerald-200 hidden sm:inline">
              ✨ v1.0
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div class="md:hidden bg-emerald-700/50 px-4 py-2 flex justify-around">
      <router-link 
        to="/" 
        class="text-emerald-100 hover:text-white transition text-sm no-underline"
        active-class="text-white font-bold"
        exact-active-class="text-white font-bold"
      >
        📚 Library
      </router-link>
      <router-link 
        to="/editor" 
        class="text-emerald-100 hover:text-white transition text-sm no-underline"
        active-class="text-white font-bold"
        exact-active-class="text-white font-bold"
      >
        ✍️ New Book
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDarkMode = ref(false)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
.router-link-active,
.router-link-exact-active {
  @apply bg-white/20 text-white;
}

a {
  text-decoration: none;
}

.cursor-pointer {
  transition: opacity 0.2s ease;
}

.cursor-pointer:hover {
  opacity: 0.8;
}
</style>