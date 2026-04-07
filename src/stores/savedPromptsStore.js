import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as savedPromptsApi from '@/api/savedPromptsApi'

export const useSavedPromptsStore = defineStore('savedPrompts', () => {
   const prompts = ref([])
   const loading = ref(false)
   const error = ref(null)

   async function load() {
      loading.value = true
      error.value = null
      try {
         prompts.value = await savedPromptsApi.listPrompts()
      } catch (err) {
         error.value = err.message
      } finally {
         loading.value = false
      }
   }

   async function add({ name, promptText, description }) {
      const created = await savedPromptsApi.createPrompt({ name, promptText, description })
      prompts.value.push(created)
      prompts.value.sort((a, b) => a.name.localeCompare(b.name))
      return created
   }

   async function update(id, { name, promptText, description }) {
      const updated = await savedPromptsApi.updatePrompt(id, { name, promptText, description })
      const idx = prompts.value.findIndex((p) => p.id === id)
      if (idx !== -1) prompts.value[idx] = updated
      prompts.value.sort((a, b) => a.name.localeCompare(b.name))
      return updated
   }

   async function remove(id) {
      await savedPromptsApi.deletePrompt(id)
      prompts.value = prompts.value.filter((p) => p.id !== id)
   }

   return { prompts, loading, error, load, add, update, remove }
})
