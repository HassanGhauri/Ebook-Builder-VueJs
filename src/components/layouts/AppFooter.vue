<!-- src/components/layout/AppFooter.vue -->
<template>
  <footer class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xl">🌙</span>
            <h3 class="text-lg font-bold">Crescent Books</h3>
          </div>
          <p class="text-sm text-indigo-200 mt-2">
            Create beautiful ebooks without any backend. All your work stays on your device.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-3">
            Quick Links
          </h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-indigo-100 hover:text-white transition text-sm">
                📚 My Library
              </router-link>
            </li>
            <li>
              <router-link to="/editor" class="text-indigo-100 hover:text-white transition text-sm">
                ✍️ New Book
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Stats & Info -->
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-3">
            Features
          </h4>
          <ul class="space-y-1 text-sm text-indigo-100">
            <li>📄 Rich Text Editor</li>
            <li>📤 Export to PDF, EPUB, DOCX</li>
            <li>📥 Import from DOCX, TXT</li>
            <li>💾 Auto-save to IndexedDB</li>
            <li>🎨 Book Cover Generator</li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-indigo-400/30 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-indigo-200">
        <p>
          © {{ new Date().getFullYear() }} Crescent Books. Built with ❤️ using Vue.js
        </p>
        <div class="flex space-x-4 mt-2 sm:mt-0">
          <span>✨ Made for your portfolio</span>
        </div>
      </div>
    </div>
  </footer>
</template>