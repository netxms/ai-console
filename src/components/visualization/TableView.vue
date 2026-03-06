<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'

const props = defineProps({
  data: { type: Object, required: true },
})

const severityLabels = ['Normal', 'Warning', 'Minor', 'Major', 'Critical']
const severityColors = {
  0: 'success',
  1: 'warn',
  2: 'warn',
  3: 'danger',
  4: 'danger',
}

const rows = computed(() => props.data.rows || [])

const filters = ref({
  global: { value: null, matchMode: 'contains' },
})

function formatDatetime(value) {
  if (!value) return ''
  const d = new Date(typeof value === 'number' ? value * 1000 : value)
  return d.toLocaleString()
}

function getColumnsAsCsv() {
  const cols = props.data.columns || []
  const header = cols.map((c) => c.header).join(',')
  const body = rows.value.map((row) =>
    cols.map((c) => {
      const val = row[c.field]
      const str = String(val ?? '')
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }).join(',')
  ).join('\n')
  return header + '\n' + body
}

defineExpose({ getColumnsAsCsv })
</script>

<template>
  <div class="table-view">
    <div class="table-filter-bar">
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Filter..."
          size="small"
          class="table-filter-input"
        />
      </span>
    </div>
    <DataTable
      v-model:filters="filters"
      :value="rows"
      :global-filter-fields="(data.columns || []).map(c => c.field)"
      paginator
      :rows="20"
      :rows-per-page-options="[10, 20, 50, 100]"
      sortable
      removable-sort
      scroll-height="flex"
      scrollable
      class="table-full"
    >
      <Column
        v-for="col in data.columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="true"
      >
        <template #body="{ data: row }">
          <Tag
            v-if="col.type === 'severity'"
            :value="severityLabels[row[col.field]] || String(row[col.field])"
            :severity="severityColors[row[col.field]] || 'secondary'"
          />
          <span v-else-if="col.type === 'datetime'">
            {{ formatDatetime(row[col.field]) }}
          </span>
          <span v-else>{{ row[col.field] }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style>
.table-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-filter-bar {
  padding: 0 0 0.5rem;
  flex-shrink: 0;
}

.table-filter-input {
  width: 240px;
}

.table-full {
  flex: 1;
}
</style>
