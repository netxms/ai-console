<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { escapeHtml } from '@/utils/escapeHtml'

const props = defineProps({
  data: { type: Object, required: true },
})

const chartRef = ref(null)
const error = ref(null)

const option = computed(() => {
  try {
    const d = props.data

    if (d.type === 'pie') {
      return {
        tooltip: {
          trigger: 'item',
          formatter: (params) => `${escapeHtml(params.name)}: ${params.value} (${params.percent}%)`,
        },
        legend: { orient: 'vertical', right: 16, top: 'center' },
        series: [{
          type: 'pie',
          radius: ['35%', '70%'],
          center: ['40%', '50%'],
          data: d.categories.map((name, i) => ({
            name,
            value: d.values[i],
            itemStyle: d.colors?.[i] ? { color: d.colors[i] } : undefined,
          })),
          label: { formatter: '{b}: {d}%' },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } },
        }],
      }
    }

    const isHorizontal = d.orientation === 'horizontal'
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: 16, right: 16, bottom: 32, left: isHorizontal ? 100 : 60 },
      [isHorizontal ? 'yAxis' : 'xAxis']: {
        type: 'category',
        data: d.categories,
      },
      [isHorizontal ? 'xAxis' : 'yAxis']: {
        type: 'value',
      },
      series: [{
        type: 'bar',
        data: d.values.map((v, i) => ({
          value: v,
          itemStyle: d.colors?.[i] ? { color: d.colors[i] } : undefined,
        })),
      }],
    }
  } catch (e) {
    error.value = e.message
    return null
  }
})

defineExpose({ chartRef })
</script>

<template>
  <div class="barpie-view">
    <div v-if="error" class="viz-error">
      <i class="pi pi-exclamation-triangle" />
      <span>Failed to render chart: {{ error }}</span>
    </div>
    <VChart v-else-if="option" ref="chartRef" :option="option" class="barpie-full" autoresize />
  </div>
</template>

<style>
.barpie-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.barpie-full {
  flex: 1;
  min-height: 300px;
}

.viz-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--p-red-500);
  font-size: 0.9rem;
}
</style>
