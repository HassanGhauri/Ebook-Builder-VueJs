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
    },
    {
      path: '/editor',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/editor/:id',
      name: 'editor-book',
      component: EditorView,
      props: true,
    },
  ],
})

export default router
