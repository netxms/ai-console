<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'

const props = defineProps({
   data: { type: Object, required: true },
})

const hops = computed(() => props.data.hops || [])

const hopTypeColors = {
   ROUTE: { bg: 'var(--p-blue-50)', border: 'var(--p-blue-200)', text: 'var(--p-blue-600)', dot: 'var(--p-blue-500)' },
   VPN: { bg: 'var(--p-purple-50)', border: 'var(--p-purple-200)', text: 'var(--p-purple-600)', dot: 'var(--p-purple-500)' },
   PROXY: { bg: 'var(--p-orange-50)', border: 'var(--p-orange-200)', text: 'var(--p-orange-600)', dot: 'var(--p-orange-500)' },
   DESTINATION: { bg: 'var(--p-green-50)', border: 'var(--p-green-200)', text: 'var(--p-green-600)', dot: 'var(--p-green-500)' },
   L2_LINK: { bg: 'var(--p-teal-50)', border: 'var(--p-teal-200)', text: 'var(--p-teal-600)', dot: 'var(--p-teal-500)' },
}

function typeStyle(type) {
   return hopTypeColors[type] || hopTypeColors.DESTINATION
}

function hopDetail(hop) {
   switch (hop.type) {
      case 'ROUTE': {
         const parts = []
         if (hop.name) parts.push(hop.name)
         if (hop.nextHop) parts.push(`next hop ${hop.nextHop}`)
         if (hop.route) parts.push(`via ${hop.route}`)
         return parts.join(' \u2014 ')
      }
      case 'VPN':
         return hop.vpnConnectorName || `VPN connector ${hop.vpnConnectorId || ''}`
      case 'PROXY':
         return hop.proxyNodeName || `Proxy node ${hop.proxyNodeId || ''}`
      case 'L2_LINK':
         return hop.name || 'L2 link'
      case 'DESTINATION':
         return 'Destination'
      default:
         return hop.name || ''
   }
}

function getColumnsAsCsv() {
   const header = 'Hop,Node,Node ID,Type,Details'
   const body = hops.value.map((hop, i) =>
      [i + 1, hop.objectName || '', hop.objectId || '', hop.type || '', hopDetail(hop).replace(/,/g, ';')].join(',')
   ).join('\n')
   return header + '\n' + body
}

defineExpose({ getColumnsAsCsv })
</script>

<template>
   <div class="route-view">
      <div class="route-view-header">
         <h3 class="route-view-title">{{ data.title || 'Network Path' }}</h3>
         <Tag
            :value="data.isComplete ? 'Complete' : 'Incomplete'"
            :severity="data.isComplete ? 'success' : 'warn'"
         />
         <span class="route-view-count">{{ hops.length }} hop{{ hops.length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="route-view-path">
         <div v-for="(hop, i) in hops" :key="i" class="route-hop">
            <div class="route-hop-spine">
               <div class="route-hop-dot" :style="{ background: typeStyle(hop.type).dot }" />
               <div
                  v-if="i < hops.length - 1 || !data.isComplete"
                  class="route-hop-line"
                  :class="{ 'route-hop-line-dashed': hop.type === 'VPN' || hop.type === 'PROXY' }"
                  :style="hop.type === 'VPN' || hop.type === 'PROXY'
                     ? { background: 'none', borderColor: typeStyle(hop.type).dot }
                     : { background: typeStyle(hop.type).dot }"
               />
            </div>
            <div class="route-hop-content">
               <div class="route-hop-node">
                  <span class="route-hop-name">{{ hop.objectName || `Node ${hop.objectId}` }}</span>
                  <span class="route-hop-id">[{{ hop.objectId }}]</span>
               </div>
               <div class="route-hop-detail">
                  <span
                     class="route-hop-type-badge"
                     :style="{
                        background: typeStyle(hop.type).bg,
                        borderColor: typeStyle(hop.type).border,
                        color: typeStyle(hop.type).text,
                     }"
                  >{{ hop.type }}</span>
                  <span class="route-hop-info">{{ hopDetail(hop) }}</span>
               </div>
            </div>
         </div>

         <div v-if="!data.isComplete" class="route-hop route-hop-incomplete">
            <div class="route-hop-spine">
               <div class="route-hop-dot route-hop-dot-broken" />
            </div>
            <div class="route-hop-content">
               <div class="route-hop-node">
                  <span class="route-hop-name route-incomplete-text">Path incomplete</span>
               </div>
               <div class="route-hop-detail">
                  <span class="route-hop-info route-incomplete-text">Next hop could not be resolved</span>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<style>
.route-view {
   height: 100%;
   display: flex;
   flex-direction: column;
}

.route-view-header {
   display: flex;
   align-items: center;
   gap: 0.75rem;
   padding-bottom: 0.75rem;
   border-bottom: 1px solid var(--p-surface-border);
   margin-bottom: 0.75rem;
   flex-shrink: 0;
}

.route-view-title {
   margin: 0;
   font-size: 1rem;
   font-weight: 600;
   color: var(--p-text-color);
}

.route-view-count {
   font-size: 0.8rem;
   color: var(--p-text-muted-color);
   margin-left: auto;
}

.route-view-path {
   flex: 1;
   overflow-y: auto;
}

.route-hop {
   display: flex;
   gap: 0.75rem;
   min-height: 52px;
}

.route-hop-spine {
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 16px;
   flex-shrink: 0;
}

.route-hop-dot {
   width: 12px;
   height: 12px;
   border-radius: 50%;
   flex-shrink: 0;
   margin-top: 4px;
}

.route-hop-dot-broken {
   background: transparent !important;
   border: 2px dashed var(--p-orange-400);
   box-sizing: border-box;
}

.route-hop-line {
   width: 2px;
   flex: 1;
   min-height: 12px;
}

.route-hop-line-dashed {
   background: none !important;
   border-left: 2px dashed;
   width: 0;
}

.route-hop-content {
   flex: 1;
   padding-bottom: 0.75rem;
   min-width: 0;
}

.route-hop-node {
   display: flex;
   align-items: baseline;
   gap: 0.375rem;
}

.route-hop-name {
   font-size: 0.9rem;
   font-weight: 600;
   color: var(--p-text-color);
}

.route-hop-id {
   font-size: 0.75rem;
   color: var(--p-text-muted-color);
}

.route-hop-detail {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   margin-top: 0.25rem;
}

.route-hop-type-badge {
   font-size: 0.65rem;
   font-weight: 600;
   padding: 0.1rem 0.4rem;
   border-radius: 4px;
   border: 1px solid;
   white-space: nowrap;
   text-transform: uppercase;
   letter-spacing: 0.03em;
}

.route-hop-info {
   font-size: 0.8rem;
   color: var(--p-text-muted-color);
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.route-incomplete-text {
   color: var(--p-orange-500);
   font-style: italic;
}
</style>
