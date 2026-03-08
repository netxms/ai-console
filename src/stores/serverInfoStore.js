import { ref } from 'vue'
import { defineStore } from 'pinia'
import { get } from '@/api/client'

export const useServerInfoStore = defineStore('serverInfo', () => {
   const data = ref(null)
   const loading = ref(false)
   const error = ref(null)

   async function fetch() {
      if (data.value || loading.value) return
      loading.value = true
      error.value = null
      try {
         data.value = await get('/v1/server-info')
      } catch (e) {
         error.value = e.message
      } finally {
         loading.value = false
      }
   }

   const tileServerURL = () => data.value?.options?.tileServerURL || null

   return { data, loading, error, fetch, tileServerURL }
})
