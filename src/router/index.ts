// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import LibraryView from '@/views/LibraryView.vue'
import EditorView from '@/views/EditorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'library',
      component: LibraryView,
      meta: { title: 'Library - Crescent Books' },
    },
    {
      path: '/editor',
      name: 'editor',
      component: EditorView,
      meta: { title: 'Editor - Crescent Books' },
    },
    {
      path: '/editor/:id',
      name: 'editor-book',
      component: EditorView,
      props: true,
      meta: { title: 'Editor - Crescent Books' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Update page title on navigation
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'Crescent Books'
  next()
})

export default router
