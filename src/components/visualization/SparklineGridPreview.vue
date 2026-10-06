<script setup>
import { computed } from 'vue'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { t } from '@/i18n'

const props = defineProps({
   data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()

const items = computed(() => props.data.items || [])
const previewItems = computed(() => items.value.slice(0, 3))
const remainingCount = computed(() => Math.max(0, items.value.length - 3))

function formatValue(value, unit) {
   if (value == null) return '—'
   const formatted = typeof value === 'number'
      ? (Number.isInteger(value) ? value.toString() : value.toFixed(1))
      : value
   return unit ? `${formatted} ${unit}` : formatted
}

function openTab() {
   vizStore.addTab(props.data)
}
</script>

<template>
   <div class="sparkline-grid-preview" @click="openTab">
      <div class="preview-header">
         <i class="pi pi-chart-bar" />
         <span>{{ data.title || t('viz.types.sparkline-grid') }}</span>
         <i class="pi pi-external-link preview-link" />
      </div>
      <div class="sparkline-preview-list">
         <div v-for="(item, i) in previewItems" :key="i" class="sparkline-preview-row">
            <span class="sparkline-preview-rank">{{ i + 1 }}</span>
            <span class="sparkline-preview-label">{{ item.label }}</span>
            <bdi class="sparkline-preview-value">{{ formatValue(item.value, data.unit) }}</bdi>
         </div>
         <div v-if="remainingCount > 0" class="sparkline-preview-more">
            {{ t('viz.sparkline.more', { count: remainingCount }) }}
         </div>
      </div>
   </div>
</template>

<style>
.sparkline-grid-preview {
   border: 1px solid var(--p-surface-border);
   border-radius: 8px;
   background: var(--p-surface-card);
   cursor: pointer;
   overflow: hidden;
   transition: border-color 0.15s;
}

.sparkline-grid-preview:hover {
   border-color: var(--p-primary-color);
}

.sparkline-grid-preview .preview-header {
   display: flex;
   align-items: center;
   gap: 0.375rem;
   padding: 0.5rem 0.75rem;
   font-size: 0.8rem;
   font-weight: 500;
   color: var(--p-text-muted-color);
   border-bottom: 1px solid var(--p-surface-border);
}

.sparkline-grid-preview .preview-link {
   margin-inline-start: auto;
   font-size: 0.7rem;
   opacity: 0;
   transition: opacity 0.15s;
}

.sparkline-grid-preview:hover .preview-link {
   opacity: 1;
}

.sparkline-preview-list {
   padding: 0.5rem 0.75rem;
}

.sparkline-preview-row {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   padding: 0.25rem 0;
   font-size: 0.8rem;
}

.sparkline-preview-rank {
   flex-shrink: 0;
   width: 1.25rem;
   text-align: end;
   font-weight: 600;
   color: var(--p-text-muted-color);
   font-size: 0.75rem;
}

.sparkline-preview-label {
   flex: 1;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   color: var(--p-text-color);
}

.sparkline-preview-value {
   flex-shrink: 0;
   font-weight: 600;
   font-variant-numeric: tabular-nums;
}

.sparkline-preview-more {
   font-size: 0.75rem;
   color: var(--p-text-muted-color);
   padding: 0.25rem 0 0;
   padding-inline-start: 1.75rem;
}
</style>
