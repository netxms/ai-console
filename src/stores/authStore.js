import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const sessionGuid = ref(localStorage.getItem('aiConsoleSessionGuid'))
  const user = ref(JSON.parse(localStorage.getItem('aiConsoleUser') || 'null'))
  const error = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!sessionGuid.value)

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      const result = await authApi.login(username, password)
      sessionGuid.value = result.sessionGuid
      user.value = result.user
      localStorage.setItem('aiConsoleSessionGuid', result.sessionGuid)
      localStorage.setItem('aiConsoleUser', JSON.stringify(result.user))
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    authApi.logout().catch(() => {})
    sessionGuid.value = null
    user.value = null
    localStorage.removeItem('aiConsoleSessionGuid')
    localStorage.removeItem('aiConsoleUser')
  }

  async function checkSession() {
    if (!sessionGuid.value) return false
    try {
      await authApi.validateSession()
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    sessionGuid,
    user,
    error,
    loading,
    isAuthenticated,
    login,
    logout,
    checkSession,
  }
})
