<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  type: { type: String, required: true },
  contentEl: { type: Object, default: null },
  viewRef: { type: Object, default: null },
})

const isFullscreen = ref(false)

async function toggleFullscreen() {
  if (!props.contentEl) return
  if (!document.fullscreenElement) {
    await props.contentEl.requestFullscreen()
    isFullscreen.value = true
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

function exportPng() {
  if (props.viewRef?.exportPng) {
    props.viewRef.exportPng()
    return
  }
  const chart = props.viewRef?.chartRef
  if (!chart) return
  const url = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
  const a = document.createElement('a')
  a.href = url
  a.download = 'chart.png'
  a.click()
}

function copyCsv() {
  if (!props.viewRef?.getColumnsAsCsv) return
  const csv = props.viewRef.getColumnsAsCsv()
  navigator.clipboard.writeText(csv)
}

function resetView() {
  if (props.viewRef?.resetView) props.viewRef.resetView()
}

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})
</script>

<template>
  <div class="viz-toolbar">
    <Button
      icon="pi pi-window-maximize"
      severity="secondary"
      text
      size="small"
      v-tooltip.bottom="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
      @click="toggleFullscreen"
    />
    <Button
      v-if="type !== 'table' && type !== 'map' && type !== 'route' && type !== 'sparkline-grid'"
      icon="pi pi-image"
      severity="secondary"
      text
      size="small"
      v-tooltip.bottom="'Export PNG'"
      @click="exportPng"
    />
    <Button
      v-if="type === 'map'"
      icon="pi pi-replay"
      severity="secondary"
      text
      size="small"
      v-tooltip.bottom="'Reset View'"
      @click="resetView"
    />
    <Button
      v-if="type === 'table' || type === 'map' || type === 'route' || type === 'sparkline-grid'"
      icon="pi pi-copy"
      severity="secondary"
      text
      size="small"
      v-tooltip.bottom="'Copy as CSV'"
      @click="copyCsv"
    />
  </div>
</template>

<style>
.viz-toolbar {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid var(--p-surface-border);
  background: var(--p-surface-card);
  flex-shrink: 0;
}
</style>
