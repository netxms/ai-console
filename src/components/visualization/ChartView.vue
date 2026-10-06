<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { escapeHtml } from '@/utils/escapeHtml'
import { t } from '@/i18n'

const props = defineProps({
  data: { type: Object, required: true },
})

const chartRef = ref(null)
const error = ref(null)

const option = computed(() => {
  try {
    const d = props.data
    const series = (d.series || []).map((s) => ({
      name: escapeHtml(s.name),
      type: d.chartType === 'area' ? 'line' : 'line',
      areaStyle: d.chartType === 'area' ? { opacity: 0.3 } : undefined,
      data: s.data,
      smooth: true,
      showSymbol: false,
    }))

    const markLines = (d.thresholds || []).map((t) => ({
      yAxis: t.value,
      label: { formatter: t.label, position: 'insideEndTop' },
      lineStyle: { color: t.color, type: 'dashed' },
    }))

    if (markLines.length && series.length) {
      series[0].markLine = {
        silent: true,
        symbol: 'none',
        data: markLines,
      }
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: series.length > 1 ? { top: 0 } : undefined,
      grid: { top: series.length > 1 ? 32 : 16, right: 16, bottom: 60, left: 60 },
      xAxis: {
        type: 'time',
      },
      yAxis: {
        type: 'value',
        name: series[0]?.name,
        axisLabel: {
          formatter: (v) => series[0]?.unit ? `${v}${series[0].unit}` : v,
        },
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 8 },
      ],
      series,
    }
  } catch (e) {
    error.value = e.message
    return null
  }
})

defineExpose({ chartRef })
</script>

<template>
  <div class="chart-view">
    <div v-if="error" class="viz-error">
      <i class="pi pi-exclamation-triangle" />
      <span>{{ t('viz.chartRenderFailed', { error }) }}</span>
    </div>
    <template v-else-if="option">
      <span v-if="data.aggregated" class="aggregated-badge">{{ t('common.aggregated') }}</span>
      <VChart ref="chartRef" :option="option" class="chart-full" autoresize />
    </template>
  </div>
</template>

<style>
.chart-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-full {
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
