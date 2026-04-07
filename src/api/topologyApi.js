import { get } from './client'

export function getTopology(objectId, type, params = {}) {
   const qs = new URLSearchParams()
   if (params.radius != null) qs.set('radius', params.radius)
   if (params.useL1Topology != null) qs.set('useL1Topology', params.useL1Topology)
   const query = qs.toString()
   return get(`/v1/objects/${objectId}/topology/${type}${query ? '?' + query : ''}`)
}
