<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { fetchDciChartData } from '@/api/dciApi'

const props = defineProps({
   data: { type: Object, required: true },
})

const items = computed(() => props.data.items || [])
const unit = computed(() => props.data.unit || '')
const sparklines = ref({})
const maxValue = computed(() => {
   let max = 0
   for (const item of items.value) {
      if (item.value > max) max = item.value
   }
   return max || 1
})

onMounted(async () => {
   const fetches = items.value
      .filter((item) => item.nodeId && item.dciId)
      .map(async (item) => {
         try {
            const result = await fetchDciChartData(
               [{ nodeId: item.nodeId, dciId: item.dciId, label: item.label }],
               { timeRange: item.timeRange || 'last-1h', maxDataPoints: 50 },
            )
            sparklines.value[`${item.nodeId}-${item.dciId}`] = result.series[0]?.data || []
         } catch {
            // Silently skip — row will show without sparkline
         }
      })
   await Promise.all(fetches)
})

function sparklineOption(item) {
   const key = `${item.nodeId}-${item.dciId}`
   const data = sparklines.value[key]
   if (!data || data.length < 2) return null
   return {
      grid: { top: 2, right: 2, bottom: 2, left: 2 },
      xAxis: { type: 'time', show: false },
      yAxis: { type: 'value', show: false },
      series: [{
         type: 'line',
         data,
         smooth: true,
         showSymbol: false,
         lineStyle: { width: 1.5 },
         areaStyle: { opacity: 0.15 },
      }],
      animation: false,
   }
}

function formatValue(value) {
   if (value == null) return '—'
   return typeof value === 'number'
      ? (Number.isInteger(value) ? value.toString() : value.toFixed(1))
      : value
}

function getColumnsAsCsv() {
   const header = `Rank,Label,Value${unit.value ? ' (' + unit.value + ')' : ''}`
   const body = items.value.map((item, i) =>
      [i + 1, item.label || '', item.value ?? ''].join(',')
   ).join('\n')
   return header + '\n' + body
}

defineExpose({ getColumnsAsCsv })
</script>

<template>
   <div class="sparkline-grid-view">
      <div v-for="(item, i) in items" :key="i" class="sparkline-row">
         <span class="sparkline-rank">{{ i + 1 }}</span>
         <span class="sparkline-label">{{ item.label }}</span>
         <div class="sparkline-chart-cell">
            <VChart
               v-if="sparklineOption(item)"
               :option="sparklineOption(item)"
               class="sparkline-mini"
               autoresize
            />
            <div v-else-if="item.nodeId && item.dciId" class="sparkline-loading">
               <i class="pi pi-spinner pi-spin" />
            </div>
         </div>
         <span class="sparkline-value">
            {{ formatValue(item.value) }}
            <span v-if="unit" class="sparkline-unit">{{ unit }}</span>
         </span>
         <div class="sparkline-bar-track">
            <div
               class="sparkline-bar-fill"
               :style="{ width: (item.value / maxValue * 100) + '%' }"
            />
         </div>
      </div>
   </div>
</template>

<style>
.sparkline-grid-view {
   display: flex;
   flex-direction: column;
   gap: 2px;
}

.sparkline-row {
   display: flex;
   align-items: center;
   gap: 0.75rem;
   padding: 0.5rem 0.75rem;
   background: var(--p-surface-card);
   border-radius: 6px;
}

.sparkline-rank {
   flex-shrink: 0;
   width: 1.5rem;
   text-align: right;
   font-weight: 700;
   font-size: 0.85rem;
   color: var(--p-text-muted-color);
}

.sparkline-label {
   flex: 1;
   min-width: 0;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   font-size: 0.85rem;
}

.sparkline-chart-cell {
   flex-shrink: 0;
   width: 120px;
   height: 32px;
   display: flex;
   align-items: center;
   justify-content: center;
}

.sparkline-mini {
   width: 120px;
   height: 32px;
}

.sparkline-loading {
   font-size: 0.7rem;
   color: var(--p-text-muted-color);
}

.sparkline-value {
   flex-shrink: 0;
   min-width: 4.5rem;
   text-align: right;
   font-weight: 600;
   font-size: 0.9rem;
   font-variant-numeric: tabular-nums;
}

.sparkline-unit {
   font-weight: 400;
   font-size: 0.75rem;
   color: var(--p-text-muted-color);
}

.sparkline-bar-track {
   flex-shrink: 0;
   width: 80px;
   height: 4px;
   background: var(--p-surface-hover);
   border-radius: 2px;
   overflow: hidden;
}

.sparkline-bar-fill {
   height: 100%;
   background: var(--p-primary-color);
   border-radius: 2px;
   transition: width 0.3s ease;
}
</style>
