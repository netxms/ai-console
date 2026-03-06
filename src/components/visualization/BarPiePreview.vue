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
    const d = props.data
    if (d.type === 'pie') {
      return {
        series: [{
          type: 'pie',
          radius: ['30%', '70%'],
          data: d.categories.map((name, i) => ({
            name,
            value: d.values[i],
            itemStyle: d.colors?.[i] ? { color: d.colors[i] } : undefined,
          })),
          label: { show: false },
        }],
        animation: false,
      }
    }

    const isHorizontal = d.orientation === 'horizontal'
    return {
      grid: { top: 4, right: 8, bottom: 20, left: 40 },
      [isHorizontal ? 'yAxis' : 'xAxis']: {
        type: 'category',
        data: d.categories,
        axisLabel: { fontSize: 10 },
      },
      [isHorizontal ? 'xAxis' : 'yAxis']: {
        type: 'value',
        axisLabel: { fontSize: 10 },
      },
      series: [{
        type: 'bar',
        data: d.values.map((v, i) => ({
          value: v,
          itemStyle: d.colors?.[i] ? { color: d.colors[i] } : undefined,
        })),
      }],
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
  <div class="barpie-preview" @click="openTab">
    <div class="preview-header">
      <i :class="data.type === 'pie' ? 'pi pi-chart-pie' : 'pi pi-chart-bar'" />
      <span>{{ data.title || (data.type === 'pie' ? 'Pie Chart' : 'Bar Chart') }}</span>
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
.barpie-preview {
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  background: var(--p-surface-card);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
}

.barpie-preview:hover {
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

.barpie-preview:hover .preview-link {
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
