<script setup>
import { ref } from 'vue'
import { useVisualizationStore } from '@/stores/visualizationStore'
import VizToolbar from './VizToolbar.vue'
import ChartView from './ChartView.vue'
import TableView from './TableView.vue'
import GaugeView from './GaugeView.vue'
import BarPieView from './BarPieView.vue'

const vizStore = useVisualizationStore()
const contentEl = ref(null)
const viewRef = ref(null)

const viewComponents = {
  chart: ChartView,
  table: TableView,
  gauge: GaugeView,
  bar: BarPieView,
  pie: BarPieView,
}
</script>

<template>
  <div class="viz-panel">
    <div class="viz-tabs">
      <div
        v-for="tab in vizStore.tabs"
        :key="tab.id"
        class="viz-tab"
        :class="{ active: tab.id === vizStore.activeTabId }"
        @click="vizStore.setActiveTab(tab.id)"
      >
        <span class="tab-title">{{ tab.title || tab.type }}</span>
        <button class="tab-close" @click.stop="vizStore.removeTab(tab.id)">
          <i class="pi pi-times" />
        </button>
      </div>
    </div>
    <VizToolbar
      v-if="vizStore.activeTab"
      :type="vizStore.activeTab.type"
      :content-el="contentEl"
      :view-ref="viewRef"
    />
    <div ref="contentEl" class="viz-content">
      <component
        v-if="vizStore.activeTab && viewComponents[vizStore.activeTab.type]"
        :is="viewComponents[vizStore.activeTab.type]"
        :key="vizStore.activeTabId"
        ref="viewRef"
        :data="vizStore.activeTab"
      />
    </div>
  </div>
</template>

<style>
.viz-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--p-surface-ground);
}

.viz-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--p-surface-border);
  background: var(--p-surface-card);
  flex-shrink: 0;
}

.viz-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  color: var(--p-text-muted-color);
}

.viz-tab:hover {
  background: var(--p-surface-hover);
}

.viz-tab.active {
  color: var(--p-primary-color);
  border-bottom-color: var(--p-primary-color);
}

.tab-title {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  color: inherit;
  font-size: 0.7rem;
  display: flex;
}

.tab-close:hover {
  background: var(--p-surface-border);
}

.viz-content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}
</style>
