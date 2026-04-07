<script setup>
import { computed } from 'vue'
import TextBlock from './TextBlock.vue'
import ChartPreview from '@/components/visualization/ChartPreview.vue'
import TablePreview from '@/components/visualization/TablePreview.vue'
import GaugePreview from '@/components/visualization/GaugePreview.vue'
import BarPiePreview from '@/components/visualization/BarPiePreview.vue'
import RoutePreview from '@/components/visualization/RoutePreview.vue'
import DciChartPreview from '@/components/visualization/DciChartPreview.vue'
import MapPreview from '@/components/visualization/MapPreview.vue'
import HeatmapPreview from '@/components/visualization/HeatmapPreview.vue'
import SparklineGridPreview from '@/components/visualization/SparklineGridPreview.vue'
import TopologyPreview from '@/components/visualization/TopologyPreview.vue'

const props = defineProps({
  blocks: { type: Array, required: true },
  isError: { type: Boolean, default: false },
  timestamp: { type: Number, default: 0 },
})

const vizComponents = {
  chart: ChartPreview,
  table: TablePreview,
  gauge: GaugePreview,
  bar: BarPiePreview,
  pie: BarPiePreview,
  route: RoutePreview,
  'dci-chart': DciChartPreview,
  map: MapPreview,
  heatmap: HeatmapPreview,
  'sparkline-grid': SparklineGridPreview,
  topology: TopologyPreview,
}

const timeLabel = computed(() => {
  if (!props.timestamp) return ''
  const d = new Date(props.timestamp)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div class="assistant-message" :class="{ 'is-error': isError }">
    <div class="assistant-avatar">
      <i class="pi pi-sparkles" />
    </div>
    <div class="assistant-content">
      <template v-for="(block, i) in blocks" :key="i">
        <TextBlock v-if="block.type === 'text'" :content="block.content" />
        <component
          v-else-if="vizComponents[block.type]"
          :is="vizComponents[block.type]"
          :data="block"
        />
        <TextBlock v-else :content="`Unsupported visualization: ${block.type}`" />
      </template>
      <span v-if="timeLabel" class="msg-time">{{ timeLabel }}</span>
    </div>
  </div>
</template>

<style>
.assistant-message {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
}

.assistant-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--sem-info);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  margin-top: 2px;
}

.assistant-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.assistant-content .msg-time {
  font-size: 0.65rem;
  color: var(--p-text-muted-color);
  align-self: flex-start;
}

.assistant-message.is-error .assistant-content .text-block {
  border-color: var(--p-red-200);
  background: var(--p-red-50);
  color: var(--p-red-700);
}
</style>
