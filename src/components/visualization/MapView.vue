<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useServerInfoStore } from '@/stores/serverInfoStore'
import { createTileLayer } from '@/utils/tileUrl'

const props = defineProps({
   data: { type: Object, required: true },
})

const mapContainer = ref(null)
const error = ref(null)
let map = null
let initialView = null

const statusColors = {
   normal: 'var(--p-green-500)',
   warning: 'var(--p-yellow-500)',
   minor: 'var(--p-orange-400)',
   major: 'var(--p-orange-600)',
   critical: 'var(--p-red-500)',
}

function markerColor(status) {
   return statusColors[status] || 'var(--p-primary-color)'
}

function createMarkerIcon(status) {
   const color = markerColor(status)
   return L.divIcon({
      className: 'map-marker-icon',
      html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
         <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.35"/>
         </filter>
         <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.27 21.73 0 14 0z"
            fill="${color}" filter="url(#s)"/>
         <circle cx="14" cy="14" r="6" fill="#fff" opacity="0.9"/>
      </svg>`,
      iconSize: [28, 38],
      iconAnchor: [14, 38],
      popupAnchor: [0, -34],
   })
}

const serverInfoStore = useServerInfoStore()

async function initMap() {
   if (!mapContainer.value) return
   try {
      await serverInfoStore.fetch()
      const tileUrl = serverInfoStore.tileServerURL()
      if (!tileUrl) {
         error.value = 'Tile server URL not available'
         return
      }

      map = L.map(mapContainer.value, {
         zoomControl: true,
         attributionControl: false,
      })

      createTileLayer(tileUrl).addTo(map)

      const markers = props.data.markers || []
      const bounds = []

      for (const m of markers) {
         const marker = L.marker([m.lat, m.lng], {
            icon: createMarkerIcon(m.status),
            interactive: !!m.popup || !!m.label,
         })
         if (m.popup || m.label) {
            marker.bindPopup(buildPopup(m))
         }
         marker.addTo(map)
         bounds.push([m.lat, m.lng])
      }

      if (props.data.center && props.data.zoom != null) {
         initialView = { center: props.data.center, zoom: props.data.zoom }
         map.setView(props.data.center, props.data.zoom)
      } else if (bounds.length > 0) {
         initialView = { bounds, padding: [32, 32] }
         map.fitBounds(bounds, { padding: [32, 32] })
      } else {
         initialView = { center: [0, 0], zoom: 2 }
         map.setView([0, 0], 2)
      }
   } catch (e) {
      error.value = e.message
   }
}

function buildPopup(m) {
   const parts = []
   if (m.label) parts.push(`<strong>${escapeHtml(m.label)}</strong>`)
   if (m.objectName) parts.push(`<span style="font-size:0.85em;color:#666">${escapeHtml(m.objectName)}</span>`)
   if (m.popup) parts.push(`<span style="font-size:0.85em">${escapeHtml(m.popup)}</span>`)
   return parts.join('<br>')
}

function escapeHtml(str) {
   const el = document.createElement('span')
   el.textContent = str
   return el.innerHTML
}

function getColumnsAsCsv() {
   const header = 'Label,Object Name,Object ID,Latitude,Longitude,Status'
   const body = (props.data.markers || []).map((m) =>
      [
         m.label || '',
         m.objectName || '',
         m.objectId || '',
         m.lat,
         m.lng,
         m.status || '',
      ].join(',')
   ).join('\n')
   return header + '\n' + body
}

function resetView() {
   if (!map || !initialView) return
   if (initialView.bounds) {
      map.fitBounds(initialView.bounds, { padding: initialView.padding })
   } else {
      map.setView(initialView.center, initialView.zoom)
   }
}

defineExpose({ getColumnsAsCsv, resetView })

onMounted(initMap)

onBeforeUnmount(() => {
   if (map) {
      map.remove()
      map = null
   }
})
</script>

<template>
   <div class="map-view">
      <div v-if="error" class="viz-error">
         <i class="pi pi-exclamation-triangle" />
         <span>Failed to render map: {{ error }}</span>
      </div>
      <div v-else ref="mapContainer" class="map-full" />
   </div>
</template>

<style>
.map-view {
   height: 100%;
   display: flex;
   flex-direction: column;
}

.map-full {
   flex: 1;
   min-height: 300px;
}

.map-view .map-marker-icon {
   background: transparent;
   border: none;
}
</style>
