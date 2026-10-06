<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { t } from '@/i18n'

const props = defineProps({
  data: { type: Object, required: true },
})

const chartRef = ref(null)
const error = ref(null)

const option = computed(() => {
  try {
    const d = props.data
    const min = d.min ?? 0
    const max = d.max ?? 100

    const axisLine = { lineStyle: { width: 20, color: [] } }
    if (d.thresholds) {
      const warn = (d.thresholds.warning - min) / (max - min)
      const crit = (d.thresholds.critical - min) / (max - min)
      axisLine.lineStyle.color = [
        [warn, '#22c55e'],
        [crit, '#f59e0b'],
        [1, '#ef4444'],
      ]
    } else {
      axisLine.lineStyle.color = [[1, '#0ea5e9']]
    }

    return {
      series: [{
        type: 'gauge',
        min,
        max,
        progress: { show: true, width: 20 },
        axisLine,
        axisTick: { show: false },
        splitLine: { length: 10, lineStyle: { width: 2 } },
        pointer: { length: '60%', width: 6 },
        detail: {
          formatter: `{value}${d.unit || ''}`,
          fontSize: 32,
          offsetCenter: [0, '70%'],
        },
        title: { show: false },
        data: [{ value: d.value }],
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
  <div class="gauge-view">
    <div v-if="error" class="viz-error">
      <i class="pi pi-exclamation-triangle" />
      <span>{{ t('viz.gaugeRenderFailed', { error }) }}</span>
    </div>
    <VChart v-else-if="option" ref="chartRef" :option="option" class="gauge-full" autoresize />
  </div>
</template>

<style>
.gauge-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-full {
  width: 100%;
  max-width: 500px;
  height: 400px;
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
