<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useVisualizationStore } from '@/stores/visualizationStore'

const props = defineProps({
  data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()

const previewRows = computed(() => (props.data.rows || []).slice(0, 4))

function openTab() {
  vizStore.addTab(props.data)
}
</script>

<template>
  <div class="table-preview" @click="openTab">
    <div class="preview-header">
      <i class="pi pi-table" />
      <span>{{ data.title || 'Table' }}</span>
      <span v-if="data.rows?.length > 4" class="row-count">
        {{ data.rows.length }} rows
      </span>
      <i class="pi pi-external-link preview-link" />
    </div>
    <DataTable :value="previewRows" size="small" class="preview-table">
      <Column
        v-for="col in data.columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      />
    </DataTable>
  </div>
</template>

<style>
.table-preview {
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  background: var(--p-surface-card);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
}

.table-preview:hover {
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

.row-count {
  font-weight: 400;
  font-size: 0.75rem;
}

.preview-link {
  margin-left: auto;
  font-size: 0.7rem;
  opacity: 0;
  transition: opacity 0.15s;
}

.table-preview:hover .preview-link {
  opacity: 1;
}

.preview-table {
  font-size: 0.8rem;
}
</style>
