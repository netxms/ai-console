<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'

const props = defineProps({
   data: { type: Object, required: true },
})

const chartRef = ref(null)
const error = ref(null)

const option = computed(() => {
   try {
      const rows = props.data.rowLabels || []
      const cols = props.data.columnLabels || []
      const values = props.data.values || []
      const colorRange = props.data.colorRange || ['#ffffff', '#3b82f6']
      const valueLabel = props.data.valueLabel || 'value'

      let min = Infinity, max = -Infinity
      const seriesData = []
      for (let r = 0; r < rows.length; r++) {
         for (let c = 0; c < cols.length; c++) {
            const v = values[r]?.[c] ?? 0
            seriesData.push([c, r, v])
            if (v < min) min = v
            if (v > max) max = v
         }
      }
      if (min === Infinity) min = 0
      if (max === -Infinity) max = 0

      return {
         tooltip: {
            formatter(params) {
               const [ci, ri, v] = params.data
               return `<strong>${rows[ri]}, ${cols[ci]}</strong><br/>${v} ${valueLabel}`
            },
         },
         grid: { top: 16, right: 80, bottom: 60, left: 80 },
         xAxis: {
            type: 'category',
            data: cols,
            splitArea: { show: true },
            axisLabel: { fontSize: 11 },
         },
         yAxis: {
            type: 'category',
            data: rows,
            splitArea: { show: true },
            axisLabel: { fontSize: 11 },
         },
         visualMap: {
            min,
            max,
            calculable: true,
            orient: 'vertical',
            right: 0,
            top: 'center',
            inRange: { color: colorRange },
            text: [max.toString(), min.toString()],
            textStyle: { fontSize: 11 },
         },
         series: [{
            type: 'heatmap',
            data: seriesData,
            label: { show: false },
            emphasis: {
               itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.3)' },
            },
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
   <div class="heatmap-view">
      <div v-if="error" class="viz-error">
         <i class="pi pi-exclamation-triangle" />
         <span>Failed to render heatmap: {{ error }}</span>
      </div>
      <VChart v-else-if="option" ref="chartRef" :option="option" class="chart-full" autoresize />
   </div>
</template>

<style>
.heatmap-view {
   height: 100%;
   display: flex;
   flex-direction: column;
}

.heatmap-view .chart-full {
   flex: 1;
   min-height: 300px;
}
</style>
