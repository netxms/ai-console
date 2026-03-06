import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useVisualizationStore = defineStore('visualization', () => {
  const tabs = ref([])
  const activeTabId = ref(null)

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) || null)

  function addTab(visualization) {
    tabs.value.push(visualization)
    activeTabId.value = visualization.id
  }

  function removeTab(id) {
    const idx = tabs.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    tabs.value.splice(idx, 1)
    if (activeTabId.value === id) {
      activeTabId.value = tabs.value[Math.min(idx, tabs.value.length - 1)]?.id || null
    }
  }

  function setActiveTab(id) {
    activeTabId.value = id
  }

  function clear() {
    tabs.value = []
    activeTabId.value = null
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    removeTab,
    setActiveTab,
    clear,
  }
})
