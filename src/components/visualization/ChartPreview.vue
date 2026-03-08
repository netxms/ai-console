<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { useVisualizationStore } from '@/stores/visualizationStore'

const props = defineProps({
  data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()
const error = ref(null)

const option = computed(() => {
  try {
    const series = (props.data.series || []).map((s) => ({
      name: s.name,
      type: props.data.chartType === 'area' ? 'line' : 'line',
      areaStyle: props.data.chartType === 'area' ? {} : undefined,
      data: s.data,
      smooth: true,
      showSymbol: false,
    }))

    return {
      grid: { top: 8, right: 8, bottom: 24, left: 40 },
      xAxis: { type: 'time', show: true, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', show: true, axisLabel: { fontSize: 10 } },
      series,
      animation: false,
    }
  } catch (e) {
    error.value = e.message
    return null
  }
})

function openTab() {
  vizStore.addTab(props.data)
}
</script>

<template>
  <div class="chart-preview" @click="openTab">
    <div class="preview-header">
      <i class="pi pi-chart-line" />
      <span>{{ data.title || 'Chart' }}</span>
      <span v-if="data.aggregated" class="aggregated-badge">aggregated</span>
      <i class="pi pi-external-link preview-link" />
    </div>
    <div v-if="error" class="viz-error">
      <i class="pi pi-exclamation-triangle" />
      <span>{{ error }}</span>
    </div>
    <VChart v-else-if="option" :option="option" class="preview-chart" autoresize />
  </div>
</template>

<style>
.chart-preview {
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  background: var(--p-surface-card);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
}

.chart-preview:hover {
  border-color: var(--p-primary-color);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
  border-bottom: 1px solid var(--p-surface-border);
}

.preview-link {
  margin-left: auto;
  font-size: 0.7rem;
  opacity: 0;
  transition: opacity 0.15s;
}

.chart-preview:hover .preview-link {
  opacity: 1;
}

.preview-chart {
  height: 120px;
  width: 100%;
}

.viz-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  font-size: 0.8rem;
  color: var(--p-red-500);
}
</style>
