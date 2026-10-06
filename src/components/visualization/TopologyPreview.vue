<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { getTopology } from '@/api/topologyApi'
import { t } from '@/i18n'

const props = defineProps({
   data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()
const loading = ref(true)
const error = ref(null)
const nodeCount = ref(0)
const linkCount = ref(0)

const typeLabels = computed(() => ({
   l2: 'L2',
   ip: 'IP',
   ospf: 'OSPF',
   internal: t('viz.topology.internal'),
}))

onMounted(async () => {
   try {
      const result = await getTopology(
         props.data.objectId,
         props.data.topologyType,
         props.data.params || {},
      )
      nodeCount.value = (result.objects || []).length
      linkCount.value = (result.links || []).length
   } catch (e) {
      error.value = e.message
   } finally {
      loading.value = false
   }
})

function openTab() {
   vizStore.addTab(props.data)
}
</script>

<template>
   <div class="topology-preview" @click="openTab">
      <div class="preview-header">
         <i class="pi pi-sitemap" />
         <span>{{ data.title || t('viz.types.topology') }}</span>
         <span class="topology-type-badge">{{ typeLabels[data.topologyType] || data.topologyType }}</span>
         <i class="pi pi-external-link preview-link" />
      </div>
      <div v-if="loading" class="topology-preview-body">
         <i class="pi pi-spinner pi-spin" />
         <span>{{ t('viz.topology.loading') }}</span>
      </div>
      <div v-else-if="error" class="viz-error">
         <i class="pi pi-exclamation-triangle" />
         <span>{{ error }}</span>
      </div>
      <div v-else class="topology-preview-body">
         <div class="topology-preview-stats">
            <div class="topology-stat">
               <span class="topology-stat-value">{{ nodeCount }}</span>
               <span class="topology-stat-label">{{ t('viz.topology.nodes', { count: nodeCount }) }}</span>
            </div>
            <div class="topology-stat">
               <span class="topology-stat-value">{{ linkCount }}</span>
               <span class="topology-stat-label">{{ t('viz.topology.links', { count: linkCount }) }}</span>
            </div>
         </div>
      </div>
   </div>
</template>

<style>
.topology-preview {
   border: 1px solid var(--p-surface-border);
   border-radius: 8px;
   background: var(--p-surface-card);
   cursor: pointer;
   overflow: hidden;
   transition: border-color 0.15s;
}

.topology-preview:hover {
   border-color: var(--p-primary-color);
}

.topology-preview .preview-header {
   display: flex;
   align-items: center;
   gap: 0.375rem;
   padding: 0.5rem 0.75rem;
   font-size: 0.8rem;
   font-weight: 500;
   color: var(--p-text-muted-color);
   border-bottom: 1px solid var(--p-surface-border);
}

.topology-preview .preview-link {
   margin-inline-start: auto;
   font-size: 0.7rem;
   opacity: 0;
   transition: opacity 0.15s;
}

.topology-preview:hover .preview-link {
   opacity: 1;
}

.topology-type-badge {
   font-size: 0.65rem;
   font-weight: 600;
   color: var(--p-primary-color);
   background: var(--p-primary-50);
   border: 1px solid var(--p-primary-200);
   border-radius: 4px;
   padding: 0.1rem 0.35rem;
}

.topology-preview-body {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
   padding: 1rem 0.75rem;
   font-size: 0.8rem;
   color: var(--p-text-muted-color);
}

.topology-preview-stats {
   display: flex;
   gap: 2rem;
}

.topology-stat {
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 0.125rem;
}

.topology-stat-value {
   font-size: 1.5rem;
   font-weight: 700;
   color: var(--p-text-color);
   line-height: 1;
}

.topology-stat-label {
   font-size: 0.75rem;
   color: var(--p-text-muted-color);
}
</style>
