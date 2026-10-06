<script setup>
import { computed } from 'vue'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { t } from '@/i18n'

const props = defineProps({
  data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()

const statusColor = computed(() => {
  const { value, thresholds } = props.data
  if (!thresholds) return 'var(--p-primary-color)'
  if (value >= (thresholds.critical ?? Infinity)) return '#ef4444'
  if (value >= (thresholds.warning ?? Infinity)) return '#f59e0b'
  return '#22c55e'
})

const progressPercent = computed(() => {
  const min = props.data.min ?? 0
  const max = props.data.max ?? 100
  if (max <= min) return 0
  return Math.max(0, Math.min(100, ((props.data.value - min) / (max - min)) * 100))
})

function openTab() {
  vizStore.addTab(props.data)
}
</script>

<template>
  <div class="gauge-preview" @click="openTab">
    <div class="preview-header">
      <i class="pi pi-gauge" />
      <span>{{ data.title || t('viz.types.gauge') }}</span>
      <i class="pi pi-external-link preview-link" />
    </div>
    <div class="gauge-value-row">
      <span class="gauge-value" :style="{ color: statusColor }">
        {{ data.value }}
      </span>
      <span v-if="data.unit" class="gauge-unit">{{ data.unit }}</span>
    </div>
    <div class="gauge-progress-track">
      <div
        class="gauge-progress-fill"
        :style="{ width: progressPercent + '%', background: statusColor }"
      />
    </div>
  </div>
</template>

<style>
.gauge-preview {
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  background: var(--p-surface-card);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
}

.gauge-preview:hover {
  border-color: var(--p-primary-color);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
  border-bottom: 1px solid var(--p-surface-border);
}

.preview-link {
  margin-inline-start: auto;
  font-size: 0.7rem;
  opacity: 0;
  transition: opacity 0.15s;
}

.gauge-preview:hover .preview-link {
  opacity: 1;
}

.gauge-value-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  padding: 0.75rem 0.75rem 0.375rem;
  gap: 0.25rem;
  /* Value is always followed by its unit, also in right-to-left languages */
  direction: ltr;
}

.gauge-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.gauge-unit {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}

.gauge-progress-track {
  height: 4px;
  background: var(--p-surface-hover);
  margin: 0 0.75rem 0.625rem;
  border-radius: 2px;
  overflow: hidden;
}

.gauge-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
