<!-- src/App.vue -->
<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/layouts/AppHeader.vue'
import AppFooter from './components/layouts/AppFooter.vue'
</script>

<style>
/* Dark mode classes - these will work with Tailwind's dark: prefix */
.dark {
  color-scheme: dark;
}
</style>