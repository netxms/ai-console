<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { t } from '@/i18n'

const props = defineProps({
   data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()
const canvas = ref(null)

const MAX_PREVIEW_ROWS = 200
const MAX_PREVIEW_COLS = 200

const rows = computed(() => (props.data.rowLabels || []).slice(0, MAX_PREVIEW_ROWS))
const cols = computed(() => (props.data.columnLabels || []).slice(0, MAX_PREVIEW_COLS))

function parseColor(color) {
   const ctx = document.createElement('canvas').getContext('2d')
   ctx.fillStyle = color
   return ctx.fillStyle
}

function hexToRgb(hex) {
   const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
   if (!m) return [128, 128, 128]
   return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

function interpolateColor(t, c0, c1) {
   return [
      Math.round(c0[0] + (c1[0] - c0[0]) * t),
      Math.round(c0[1] + (c1[1] - c0[1]) * t),
      Math.round(c0[2] + (c1[2] - c0[2]) * t),
   ]
}

onMounted(() => {
   if (!canvas.value) return
   const values = props.data.values || []
   const numRows = Math.min(rows.value.length, MAX_PREVIEW_ROWS)
   const numCols = Math.min(cols.value.length, MAX_PREVIEW_COLS)
   if (numRows === 0 || numCols === 0) return

   const colorRange = props.data.colorRange || ['#ffffff', '#3b82f6']
   const rgb0 = hexToRgb(parseColor(colorRange[0]))
   const rgb1 = hexToRgb(parseColor(colorRange[1]))

   let min = Infinity, max = -Infinity
   for (const row of values) {
      for (const v of row) {
         if (v < min) min = v
         if (v > max) max = v
      }
   }
   const range = max - min || 1

   const el = canvas.value
   const cellW = Math.floor(el.width / numCols)
   const cellH = Math.floor(el.height / numRows)
   const ctx = el.getContext('2d')

   for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
         const t = (values[r]?.[c] ?? 0 - min) / range
         const [rr, gg, bb] = interpolateColor(Math.max(0, Math.min(1, t)), rgb0, rgb1)
         ctx.fillStyle = `rgb(${rr},${gg},${bb})`
         ctx.fillRect(c * cellW, r * cellH, cellW, cellH)
      }
   }
})

function openTab() {
   vizStore.addTab(props.data)
}
</script>

<template>
   <div class="heatmap-preview" @click="openTab">
      <div class="preview-header">
         <i class="pi pi-th-large" />
         <span>{{ data.title || t('viz.types.heatmap') }}</span>
         <i class="pi pi-external-link preview-link" />
      </div>
      <div class="heatmap-preview-body">
         <canvas ref="canvas" :width="cols.length * 6 || 144" :height="rows.length * 10 || 70" class="heatmap-canvas" />
         <span class="heatmap-dims">{{ rows.length }} &times; {{ cols.length }}</span>
      </div>
   </div>
</template>

<style>
.heatmap-preview {
   border: 1px solid var(--p-surface-border);
   border-radius: 8px;
   background: var(--p-surface-card);
   cursor: pointer;
   overflow: hidden;
   transition: border-color 0.15s;
}

.heatmap-preview:hover {
   border-color: var(--p-primary-color);
}

.heatmap-preview .preview-header {
   display: flex;
   align-items: center;
   gap: 0.375rem;
   padding: 0.5rem 0.75rem;
   font-size: 0.8rem;
   font-weight: 500;
   color: var(--p-text-muted-color);
   border-bottom: 1px solid var(--p-surface-border);
}

.heatmap-preview .preview-link {
   margin-inline-start: auto;
   font-size: 0.7rem;
   opacity: 0;
   transition: opacity 0.15s;
}

.heatmap-preview:hover .preview-link {
   opacity: 1;
}

.heatmap-preview-body {
   display: flex;
   align-items: center;
   justify-content: center;
   flex-direction: column;
   gap: 0.375rem;
   padding: 0.625rem 0.75rem;
}

.heatmap-canvas {
   width: 100%;
   max-height: 80px;
   border-radius: 4px;
   image-rendering: pixelated;
}

.heatmap-dims {
   font-size: 0.7rem;
   color: var(--p-text-muted-color);
}
</style>
