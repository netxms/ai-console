<script setup>
import { computed } from 'vue'
import { useVisualizationStore } from '@/stores/visualizationStore'

const props = defineProps({
   data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()

const hops = computed(() => props.data.hops || [])
const previewHops = computed(() => hops.value.slice(0, 5))
const remainingCount = computed(() => Math.max(0, hops.value.length - 5))

const hopTypeColors = {
   ROUTE: 'var(--p-blue-500)',
   VPN: 'var(--p-purple-500)',
   PROXY: 'var(--p-orange-500)',
   DESTINATION: 'var(--p-green-500)',
   L2_LINK: 'var(--p-teal-500)',
}

function hopColor(type) {
   return hopTypeColors[type] || 'var(--p-surface-400)'
}

function openTab() {
   vizStore.addTab(props.data)
}
</script>

<template>
   <div class="route-preview" @click="openTab">
      <div class="preview-header">
         <i class="pi pi-directions" />
         <span>{{ data.title || 'Network Path' }}</span>
         <span v-if="!data.isComplete" class="route-incomplete-badge">Incomplete</span>
         <i class="pi pi-external-link preview-link" />
      </div>
      <div class="route-preview-chain">
         <div v-for="(hop, i) in previewHops" :key="i" class="route-preview-hop">
            <div class="route-preview-dot" :style="{ background: hopColor(hop.type) }" />
            <span class="route-preview-name">{{ hop.objectName || `Node ${hop.objectId}` }}</span>
            <div
               v-if="i < previewHops.length - 1 || remainingCount > 0 || !data.isComplete"
               class="route-preview-line"
               :class="{ 'route-preview-line-dashed': hop.type === 'VPN' || hop.type === 'PROXY' }"
               :style="hop.type === 'VPN' || hop.type === 'PROXY'
                  ? { borderColor: hopColor(hop.type) }
                  : { background: hopColor(hop.type) }"
            />
         </div>
         <div v-if="remainingCount > 0" class="route-preview-more">
            +{{ remainingCount }} more hop{{ remainingCount > 1 ? 's' : '' }}
         </div>
         <div v-if="!data.isComplete" class="route-preview-hop">
            <div class="route-preview-dot route-preview-dot-broken" />
            <span class="route-preview-name route-incomplete-label">Unresolved</span>
         </div>
      </div>
   </div>
</template>

<style>
.route-preview {
   border: 1px solid var(--p-surface-border);
   border-radius: 8px;
   background: var(--p-surface-card);
   cursor: pointer;
   overflow: hidden;
   transition: border-color 0.15s;
}

.route-preview:hover {
   border-color: var(--p-primary-color);
}

.route-preview .preview-header {
   display: flex;
   align-items: center;
   gap: 0.375rem;
   padding: 0.5rem 0.75rem;
   font-size: 0.8rem;
   font-weight: 500;
   color: var(--p-text-muted-color);
   border-bottom: 1px solid var(--p-surface-border);
}

.route-preview .preview-link {
   margin-left: auto;
   font-size: 0.7rem;
   opacity: 0;
   transition: opacity 0.15s;
}

.route-preview:hover .preview-link {
   opacity: 1;
}

.route-incomplete-badge {
   font-size: 0.65rem;
   font-weight: 600;
   color: var(--p-orange-500);
   background: var(--p-orange-50);
   border: 1px solid var(--p-orange-200);
   border-radius: 4px;
   padding: 0.1rem 0.35rem;
}

.route-preview-chain {
   padding: 0.625rem 0.75rem;
}

.route-preview-hop {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   position: relative;
   padding-left: 0.25rem;
}

.route-preview-dot {
   width: 8px;
   height: 8px;
   border-radius: 50%;
   flex-shrink: 0;
}

.route-preview-dot-broken {
   background: var(--p-orange-500) !important;
   border: 2px dashed var(--p-orange-400);
   width: 8px;
   height: 8px;
   box-sizing: border-box;
}

.route-preview-name {
   font-size: 0.8rem;
   color: var(--p-text-color);
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.route-incomplete-label {
   color: var(--p-orange-500);
   font-style: italic;
}

.route-preview-line {
   position: absolute;
   left: calc(0.25rem + 3px);
   top: 12px;
   width: 2px;
   height: 14px;
}

.route-preview-line-dashed {
   background: none !important;
   border-left: 2px dashed;
   width: 0;
}

.route-preview-more {
   font-size: 0.75rem;
   color: var(--p-text-muted-color);
   padding-left: calc(0.25rem + 12px);
   padding-top: 2px;
   padding-bottom: 2px;
}
</style>
