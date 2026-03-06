<script setup>
import { computed } from 'vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import VisualizationPanel from '@/components/visualization/VisualizationPanel.vue'
import { useVisualizationStore } from '@/stores/visualizationStore'

const vizStore = useVisualizationStore()
const hasVisualizations = computed(() => vizStore.tabs.length > 0)
</script>

<template>
  <div class="assistant-view" :class="{ 'has-viz': hasVisualizations }">
    <ChatPanel class="chat-pane" />
    <VisualizationPanel v-if="hasVisualizations" class="viz-pane" />
  </div>
</template>

<style>
.assistant-view {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.chat-pane {
  flex: 1;
  min-width: 0;
}

.assistant-view.has-viz .chat-pane {
  flex: 0 0 45%;
  border-right: 1px solid var(--p-surface-border);
}

.viz-pane {
  flex: 1;
  min-width: 0;
}
</style>
