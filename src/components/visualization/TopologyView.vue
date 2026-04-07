<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import Button from 'primevue/button'
import { getTopology } from '@/api/topologyApi'
import { getStatusColorHex } from '@/utils/statusColors'

const props = defineProps({
   data: { type: Object, required: true },
})

const container = ref(null)
const loading = ref(true)
const error = ref(null)
let network = null

const statusNames = {
   0: 'normal',
   1: 'warning',
   2: 'minor',
   3: 'major',
   4: 'critical',
}

const linkTypeStyles = {
   0: { color: '#999999' },                                    // normal
   1: { color: '#3b82f6', dashes: true },                      // VPN
   2: { color: '#999999', width: 3 },                          // multilink
   3: { color: '#8b5cf6', dashes: [5, 5] },                    // agent tunnel
   4: { color: '#f97316', dashes: [5, 5] },                    // agent proxy
   5: { color: '#f97316', dashes: [5, 5] },                    // SSH proxy
   6: { color: '#f97316', dashes: [5, 5] },                    // SNMP proxy
   7: { color: '#f97316', dashes: [5, 5] },                    // ICMP proxy
   8: { color: '#f97316', dashes: [5, 5] },                    // sensor proxy
   9: { color: '#f97316', dashes: [5, 5] },                    // zone proxy
   10: { color: '#06b6d4' },                                    // WiFi client
}

function getEdgeStyle(type) {
   return linkTypeStyles[type] || linkTypeStyles[0]
}

async function loadTopology() {
   loading.value = true
   error.value = null
   let result
   try {
      result = await getTopology(
         props.data.objectId,
         props.data.topologyType,
         props.data.params || {},
      )
   } catch (e) {
      error.value = e.message
      loading.value = false
      return
   }

   // Show the canvas container before creating the network
   loading.value = false
   await nextTick()

   if (!container.value) return

   const nodes = new DataSet((result.objects || []).map((obj) => ({
      id: obj.id,
      label: obj.name || `#${obj.id}`,
      color: {
         background: getStatusColorHex(statusNames[obj.status] || 'normal'),
         border: getStatusColorHex(statusNames[obj.status] || 'normal'),
         highlight: {
            background: getStatusColorHex(statusNames[obj.status] || 'normal'),
            border: '#333333',
         },
      },
      font: { color: '#333333', size: 12 },
      title: `${obj.name || '#' + obj.id}\nClass: ${obj.class}\nStatus: ${statusNames[obj.status] || obj.status}`,
   })))

   // Count parallel edges between same node pairs to fan them out
   const pairCounts = {}
   for (const link of (result.links || [])) {
      const key = [Math.min(link.object1, link.object2), Math.max(link.object1, link.object2)].join('-')
      pairCounts[key] = (pairCounts[key] || 0) + 1
   }
   const pairIndexes = {}

   const edges = new DataSet((result.links || []).map((link, i) => {
      const style = getEdgeStyle(link.type)
      const key = [Math.min(link.object1, link.object2), Math.max(link.object1, link.object2)].join('-')
      const idx = pairIndexes[key] = (pairIndexes[key] || 0) + 1
      const total = pairCounts[key]

      const edge = {
         id: `edge-${i}`,
         from: link.object1,
         to: link.object2,
         color: { color: style.color, highlight: style.color },
         width: style.width || 1.5,
      }
      if (style.dashes) edge.dashes = style.dashes

      if (total > 1) {
         edge.smooth = {
            type: idx % 2 === 1 ? 'curvedCW' : 'curvedCCW',
            roundness: 0.15 + Math.floor((idx - 1) / 2) * 0.15,
         }
      }

      let edgeLabel = ''
      if (link.name) {
         edgeLabel = link.name
      } else if (link.port1 || link.port2) {
         const parts = []
         if (link.port1) parts.push(link.port1)
         if (link.port2) parts.push(link.port2)
         edgeLabel = parts.join(' \u2194 ')
      }
      if (edgeLabel) {
         edge.label = edgeLabel
         edge.font = { size: 9, color: '#666666', strokeWidth: 3, strokeColor: '#ffffff' }
      }

      return edge
   }))

   network = new Network(container.value, { nodes, edges }, {
      physics: {
         stabilization: { iterations: 100, fit: true },
         barnesHut: {
            gravitationalConstant: -3000,
            centralGravity: 0.3,
            springLength: 120,
            springConstant: 0.04,
            damping: 0.09,
         },
      },
      interaction: {
         hover: true,
         tooltipDelay: 200,
         navigationButtons: false,
         keyboard: false,
      },
      nodes: {
         shape: 'dot',
         size: 16,
         borderWidth: 2,
         shadow: { enabled: true, size: 4, x: 0, y: 2, color: 'rgba(0,0,0,0.15)' },
      },
      edges: {
         smooth: { type: 'continuous' },
      },
   })

   network.once('stabilizationIterationsDone', () => {
      network.setOptions({ physics: { enabled: false } })
   })
}

function exportPng() {
   if (!network) return
   const canvas = container.value?.querySelector('canvas')
   if (!canvas) return
   const url = canvas.toDataURL('image/png')
   const a = document.createElement('a')
   a.href = url
   a.download = 'topology.png'
   a.click()
}

async function refresh() {
   if (network) {
      network.destroy()
      network = null
   }
   await loadTopology()
}

defineExpose({ exportPng })

onMounted(loadTopology)

onBeforeUnmount(() => {
   if (network) {
      network.destroy()
      network = null
   }
})
</script>

<template>
   <div class="topology-view">
      <div v-if="loading" class="topology-loading">
         <i class="pi pi-spinner pi-spin" />
         <span>Building topology...</span>
      </div>
      <div v-else-if="error" class="viz-error">
         <i class="pi pi-exclamation-triangle" />
         <span>Failed to load topology: {{ error }}</span>
      </div>
      <template v-else>
         <div class="topology-toolbar">
            <Button
               icon="pi pi-refresh"
               severity="secondary"
               text
               size="small"
               v-tooltip.bottom="'Refresh'"
               @click="refresh"
            />
         </div>
         <div ref="container" class="topology-canvas" />
      </template>
   </div>
</template>

<style>
.topology-view {
   height: 100%;
   display: flex;
   flex-direction: column;
}

.topology-loading {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
   height: 300px;
   color: var(--p-text-muted-color);
}

.topology-toolbar {
   display: flex;
   align-items: center;
   gap: 0.25rem;
   padding: 0.25rem 0.5rem;
   flex-shrink: 0;
}

.topology-canvas {
   flex: 1;
   min-height: 300px;
}
</style>
