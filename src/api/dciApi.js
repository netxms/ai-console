import { get } from './client'

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

   const results = await Promise.all(entries.map(async (entry) => {
      const params = new URLSearchParams()
      if (resolved.timeFrom) params.set('timeFrom', resolved.timeFrom)
      if (resolved.timeTo) params.set('timeTo', resolved.timeTo)
      if (maxDataPoints) params.set('maxDataPoints', maxDataPoints)

      const qs = params.toString()
      const path = `/v1/objects/${entry.nodeId}/data-collection/${entry.dciId}/history${qs ? '?' + qs : ''}`
      const response = await get(path)

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

   return { series: results }
}
