<!-- src/components/layout/AppFooter.vue -->
<template>
  <footer class="bg-gradient-to-r from-emerald-600 to-green-700 text-white mt-auto shadow-2xl drop-shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xl">🌙</span>
            <h3 class="text-lg font-bold">Crescent Books</h3>
          </div>
          <p class="text-sm text-emerald-200 mt-2">
            Create beautiful ebooks without any backend. All your work stays on your device.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-emerald-200 mb-3">
            Quick Links
          </h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-emerald-100 hover:text-white transition text-sm">
                📚 My Library
              </router-link>
            </li>
            <li>
              <router-link to="/editor" class="text-emerald-100 hover:text-white transition text-sm">
                ✍️ New Book
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Stats & Info -->
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-emerald-200 mb-3">
            Features
          </h4>
          <ul class="space-y-1 text-sm text-emerald-100">
            <li>📄 Rich Text Editor</li>
            <li>📤 Export to PDF, EPUB, DOCX</li>
            <li>📥 Import from DOCX, TXT</li>
            <li>💾 Auto-save to IndexedDB</li>
            <li>🎨 Book Cover Generator</li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-emerald-400/30 mt-6 pt-6 text-center text-sm text-emerald-200">
        <p>
          © {{ new Date().getFullYear() }} Crescent Books. Built with ❤️ using Vue.js
        </p>
      </div>
    </div>
  </footer>
</template>