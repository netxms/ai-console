/**
 * Parse an AI response string into an array of content blocks.
 *
 * Text between visualization fences becomes { type: 'text', content }.
 * Fenced ```netxms-viz blocks become typed visualization objects with an auto-generated id.
 *
 * @param {string} raw - The raw AI response text
 * @returns {Array<{type: string, [key: string]: any}>}
 */

let vizCounter = 0

/**
 * Convert Unix-seconds timestamps to milliseconds in chart series data.
 * ECharts time axis expects milliseconds; the LLM encodes ISO timestamps
 * as Unix time in seconds.
 */
function normalizeTimestamps(viz) {
  if (!viz.series) return
  for (const s of viz.series) {
    if (!Array.isArray(s.data)) continue
    s.data = s.data.map((point) => {
      if (!Array.isArray(point) || point.length < 2) return point
      const ts = point[0]
      // Timestamps below 1e11 are in seconds (before year 5138 in seconds,
      // but only 1973 in milliseconds), so convert to milliseconds
      if (typeof ts === 'number' && ts > 0 && ts < 1e11) {
        return [ts * 1000, ...point.slice(1)]
      }
      return point
    })
  }
}

export function parseResponse(raw) {
  if (!raw) return [{ type: 'text', content: '' }]

  const blocks = []
  const fence = /```netxms-viz\s*\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = fence.exec(raw)) !== null) {
    // Text before this fence
    const textBefore = raw.slice(lastIndex, match.index).trim()
    if (textBefore) {
      blocks.push({ type: 'text', content: textBefore })
    }

    // Parse the visualization JSON
    try {
      const viz = JSON.parse(match[1].trim())
      if (viz.type) {
        viz.id = viz.id || `viz-${++vizCounter}`
        if (viz.type === 'chart' || viz.type === 'bar') {
          normalizeTimestamps(viz)
        }
        blocks.push(viz)
      } else {
        // Invalid viz block — render as text
        blocks.push({ type: 'text', content: match[0] })
      }
    } catch {
      // JSON parse failed — render the raw fence as text
      blocks.push({ type: 'text', content: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text after last fence
  const remaining = raw.slice(lastIndex).trim()
  if (remaining) {
    blocks.push({ type: 'text', content: remaining })
  }

  if (blocks.length === 0) {
    blocks.push({ type: 'text', content: raw })
  }

  return blocks
}
