<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { useServerInfoStore } from '@/stores/serverInfoStore'
import { createTileLayer } from '@/utils/tileUrl'
import { getStatusColor } from '@/utils/statusColors'
import { t } from '@/i18n'

const props = defineProps({
   data: { type: Object, required: true },
})

const vizStore = useVisualizationStore()
const serverInfoStore = useServerInfoStore()

const mapContainer = ref(null)
const error = ref(null)
let map = null

function createMarkerIcon(status) {
   const color = getStatusColor(status)
   return L.divIcon({
      className: 'map-marker-icon',
      html: `<svg width="20" height="28" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
         <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.27 21.73 0 14 0z"
            fill="${color}"/>
         <circle cx="14" cy="14" r="6" fill="#fff" opacity="0.9"/>
      </svg>`,
      iconSize: [20, 28],
      iconAnchor: [10, 28],
   })
}

async function initMap() {
   if (!mapContainer.value) return
   try {
      await serverInfoStore.fetch()
      const tileUrl = serverInfoStore.tileServerURL()
      if (!tileUrl) {
         error.value = t('viz.map.tileServerUnavailable')
         return
      }

      map = L.map(mapContainer.value, {
         dragging: false,
         scrollWheelZoom: false,
         zoomControl: false,
         doubleClickZoom: false,
         touchZoom: false,
         boxZoom: false,
         keyboard: false,
         attributionControl: false,
      })

      createTileLayer(tileUrl).addTo(map)

      const markers = props.data.markers || []
      const bounds = []

      for (const m of markers) {
         const marker = L.marker([m.lat, m.lng], { icon: createMarkerIcon(m.status), interactive: false })
         marker.addTo(map)
         bounds.push([m.lat, m.lng])
      }

      if (props.data.center && props.data.zoom != null) {
         map.setView(props.data.center, props.data.zoom)
      } else if (bounds.length > 0) {
         map.fitBounds(bounds, { padding: [16, 16] })
      } else {
         map.setView([0, 0], 2)
      }
   } catch (e) {
      error.value = e.message
   }
}

onMounted(initMap)

onBeforeUnmount(() => {
   if (map) {
      map.remove()
      map = null
   }
})

function openTab() {
   vizStore.addTab(props.data)
}
</script>

<template>
   <div class="map-preview" @click="openTab">
      <div class="preview-header">
         <i class="pi pi-map" />
         <span>{{ data.title || t('viz.types.map') }}</span>
         <i class="pi pi-external-link preview-link" />
      </div>
      <div v-if="error" class="viz-error">
         <i class="pi pi-exclamation-triangle" />
         <span>{{ error }}</span>
      </div>
      <div v-else ref="mapContainer" class="preview-map" />
   </div>
</template>

<style>
.map-preview {
   border: 1px solid var(--p-surface-border);
   border-radius: 8px;
   background: var(--p-surface-card);
   cursor: pointer;
   overflow: hidden;
   transition: border-color 0.15s;
}

.map-preview:hover {
   border-color: var(--p-primary-color);
}

.map-preview .preview-header {
   display: flex;
   align-items: center;
   gap: 0.375rem;
   padding: 0.5rem 0.75rem;
   font-size: 0.8rem;
   font-weight: 500;
   color: var(--p-text-muted-color);
   border-bottom: 1px solid var(--p-surface-border);
}

.map-preview .preview-link {
   margin-inline-start: auto;
   font-size: 0.7rem;
   opacity: 0;
   transition: opacity 0.15s;
}

.map-preview:hover .preview-link {
   opacity: 1;
}

.preview-map {
   height: 160px;
   width: 100%;
}

.map-marker-icon {
   background: transparent;
   border: none;
}
</style>
