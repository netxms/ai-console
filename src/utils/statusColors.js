const statusColors = {
   normal: 'var(--p-green-500)',
   warning: 'var(--p-yellow-500)',
   minor: 'var(--p-orange-400)',
   major: 'var(--p-orange-600)',
   critical: 'var(--p-red-500)',
}

const statusColorsHex = {
   normal: '#22c55e',
   warning: '#eab308',
   minor: '#fb923c',
   major: '#ea580c',
   critical: '#ef4444',
}

export function getStatusColor(status) {
   return statusColors[status] || 'var(--p-primary-color)'
}

export function getStatusColorHex(status) {
   return statusColorsHex[status] || '#6b7280'
}
