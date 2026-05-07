import { get } from './client'

// Per-node cache: nodeId -> Promise<Map<metricName, numericDciId>>
const dciIdCache = new Map()

function loadDciIndex(nodeId) {
   let pending = dciIdCache.get(nodeId)
   if (pending) return pending

   pending = (async () => {
      const response = await get(`/v1/objects/${nodeId}/data-collection`)
      // Tolerate a few possible response shapes: array, { dciList }, { items }, { dcis }
      const list = Array.isArray(response)
         ? response
         : response?.dciList || response?.items || response?.dcis || []
      const index = new Map()
      for (const dci of list) {
         if (dci && dci.name && dci.id != null) {
            index.set(dci.name, String(dci.id))
         }
      }
      return index
   })().catch((err) => {
      // Don't poison the cache on transient failures
      dciIdCache.delete(nodeId)
      throw err
   })

   dciIdCache.set(nodeId, pending)
   return pending
}

/**
 * Resolve a metric name to a numeric DCI ID. If the input is already numeric,
 * it's returned as-is.
 */
async function resolveDciId(nodeId, dciIdOrName) {
   if (dciIdOrName == null) {
      throw new Error('Missing dciId')
   }
   const str = String(dciIdOrName)
   if (/^\d+$/.test(str)) {
      return str
   }
   const index = await loadDciIndex(nodeId)
   const resolved = index.get(str)
   if (!resolved) {
      throw new Error(`DCI "${str}" not found on node ${nodeId}`)
   }
   return resolved
}

/**
 * Resolve a timeRange shorthand (e.g. "last-24h") to { timeFrom, timeTo } in seconds.
 * If timeFrom/timeTo are already provided, pass them through.
 */
export function resolveTimeRange({ timeFrom, timeTo, timeRange }) {
   if (timeFrom && timeTo) {
      return { timeFrom, timeTo }
   }

   if (!timeRange) {
      return {}
   }

   const match = timeRange.match(/^last-(\d+)([hHdDwWmM])$/)
   if (!match) {
      return {}
   }

   const amount = parseInt(match[1], 10)
   const unit = match[2].toLowerCase()
   const multipliers = { h: 3600, d: 86400, w: 604800, m: 2592000 }
   const seconds = amount * (multipliers[unit] || 3600)

   const now = Math.floor(Date.now() / 1000)
   return { timeFrom: now - seconds, timeTo: now }
}

/**
 * Fetch DCI historical data and return it in chart-ready format.
 * Returns { series: [{ name, unit, data: [[ts_ms, value], ...] }] }
 */
export async function fetchDciChartData(seriesConfig, { timeFrom, timeTo, timeRange, maxDataPoints = 500 } = {}) {
   const resolved = resolveTimeRange({ timeFrom, timeTo, timeRange })
   const entries = Array.isArray(seriesConfig) ? seriesConfig : [seriesConfig]

   let aggregated = false

   const results = await Promise.all(entries.map(async (entry) => {
      const params = new URLSearchParams()
      if (resolved.timeFrom) params.set('timeFrom', resolved.timeFrom)
      if (resolved.timeTo) params.set('timeTo', resolved.timeTo)
      if (maxDataPoints) params.set('maxDataPoints', maxDataPoints)

      const numericDciId = await resolveDciId(entry.nodeId, entry.dciId)
      const qs = params.toString()
      const path = `/v1/objects/${entry.nodeId}/data-collection/${numericDciId}/history${qs ? '?' + qs : ''}`
      const response = await get(path)

      if (response.aggregated) {
         aggregated = true
      }

      const data = (response.values || []).map((point) => {
         const ts = typeof point.timestamp === 'string'
            ? new Date(point.timestamp).getTime()
            : point.timestamp
         const value = response.aggregated
            ? point.avg
            : parseFloat(point.value)
         return [ts, value]
      })

      // Sort by timestamp ascending
      data.sort((a, b) => a[0] - b[0])

      return {
         name: entry.label || response.description || `DCI ${entry.dciId}`,
         unit: entry.unit || response.unitName || '',
         data,
      }
   }))

   return { series: results, aggregated }
}
