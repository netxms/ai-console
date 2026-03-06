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
