import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'netxms-theme'

export const useThemeStore = defineStore('theme', () => {
   const saved = localStorage.getItem(STORAGE_KEY)
   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
   const dark = ref(saved ? saved === 'dark' : prefersDark)

   function apply() {
      document.documentElement.classList.toggle('app-dark', dark.value)
   }

   function toggle() {
      dark.value = !dark.value
   }

   watch(dark, (val) => {
      localStorage.setItem(STORAGE_KEY, val ? 'dark' : 'light')
      apply()
   })

   apply()

   return { dark, toggle }
})
