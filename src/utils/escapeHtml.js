const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/**
 * Escapes HTML special characters in a string.
 * Use this when interpolating untrusted values into HTML contexts
 * such as ECharts tooltip formatters.
 */
export function escapeHtml(str) {
   return String(str).replace(/[&<>"']/g, (c) => MAP[c])
}
