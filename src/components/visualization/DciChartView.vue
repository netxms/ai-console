<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { fetchDciChartData } from '@/api/dciApi'

const props = defineProps({
   data: { type: Object, required: true },
})

const chartRef = ref(null)
const loading = ref(true)
const error = ref(null)
const chartData = ref(null)
const aggregated = ref(false)

onMounted(async () => {
   try {
      const seriesConfig = props.data.series || [{
         nodeId: props.data.nodeId,
         dciId: props.data.dciId,
         label: props.data.label,
      }]
      const result = await fetchDciChartData(seriesConfig, {
         timeFrom: props.data.timeFrom,
         timeTo: props.data.timeTo,
         timeRange: props.data.timeRange,
      })
      chartData.value = result
      aggregated.value = result.aggregated
   } catch (e) {
      error.value = e.message
   } finally {
      loading.value = false
   }
})

const option = computed(() => {
   if (!chartData.value) return null
   try {
      const d = props.data
      const series = chartData.value.series.map((s) => ({
         name: s.name,
         type: 'line',
         areaStyle: d.chartType === 'area' ? { opacity: 0.3 } : undefined,
         data: s.data,
         smooth: true,
         showSymbol: false,
      }))

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
               formatter: (v) => {
                  const unit = chartData.value.series[0]?.unit
                  return unit ? `${v}${unit}` : v
               },
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
      <div v-if="loading" class="dci-chart-loading">
         <i class="pi pi-spinner pi-spin" />
         <span>Loading DCI data...</span>
      </div>
      <div v-else-if="error" class="viz-error">
         <i class="pi pi-exclamation-triangle" />
         <span>Failed to load data: {{ error }}</span>
      </div>
      <template v-else-if="option">
         <span v-if="aggregated" class="aggregated-badge">aggregated</span>
         <VChart ref="chartRef" :option="option" class="chart-full" autoresize />
      </template>
   </div>
</template>

<style>
.dci-chart-loading {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
   height: 300px;
   color: var(--p-text-muted-color);
}
</style>
