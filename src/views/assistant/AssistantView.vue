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
  max-width: 900px;
  margin: 0 auto;
}

.assistant-view.has-viz .chat-pane {
  flex: 0 0 45%;
  max-width: none;
  margin: 0;
  border-right: 1px solid var(--p-surface-border);
}

.viz-pane {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .assistant-view.has-viz {
    flex-direction: column;
  }

  .assistant-view.has-viz .chat-pane {
    flex: 1 1 50%;
    min-height: 0;
    overflow: hidden;
    border-right: none;
    border-bottom: 1px solid var(--p-surface-border);
  }

  .viz-pane {
    flex: 1 1 50%;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
