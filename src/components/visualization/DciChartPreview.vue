<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { fetchDciChartData } from '@/api/dciApi'

const props = defineProps({
   data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()
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
         maxDataPoints: 200,
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
      const series = chartData.value.series.map((s) => ({
         name: s.name,
         type: 'line',
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
         <span>{{ data.title || 'DCI Chart' }}</span>
         <span v-if="aggregated" class="aggregated-badge">aggregated</span>
         <i class="pi pi-external-link preview-link" />
      </div>
      <div v-if="loading" class="preview-loading">
         <i class="pi pi-spinner pi-spin" />
         <span>Loading data...</span>
      </div>
      <div v-else-if="error" class="viz-error">
         <i class="pi pi-exclamation-triangle" />
         <span>{{ error }}</span>
      </div>
      <VChart v-else-if="option" :option="option" class="preview-chart" autoresize />
   </div>
</template>

<style>
.chart-preview .preview-loading {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
   height: 120px;
   font-size: 0.8rem;
   color: var(--p-text-muted-color);
}
</style>
