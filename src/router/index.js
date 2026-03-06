import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/AssistantLayout.vue'),
      children: [
        {
          path: '',
          name: 'assistant',
          component: () => import('@/views/assistant/AssistantView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/authStore')
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'assistant' }
  }
})

export default router
