import L from 'leaflet'

/**
 * Convert (x, y, zoom) to a quadkey string for Bing-style tile servers.
 */
function toQuadKey(x, y, z) {
   let key = ''
   for (let i = z; i > 0; i--) {
      let digit = 0
      const mask = 1 << (i - 1)
      if ((x & mask) !== 0) digit += 1
      if ((y & mask) !== 0) digit += 2
      key += digit
   }
   return key
}

/**
 * Create a Leaflet tile layer from a NetXMS tile server URL.
 *
 * Handles two formats:
 * - Template with placeholders: {x}, {y}, {-y}, {z}, {q} (quad key)
 * - Plain base URL: appends {z}/{x}/{y}.png (Leaflet handles substitution)
 */
export function createTileLayer(tileServerURL) {
   if (tileServerURL.includes('{')) {
      // Convert {q} (quad key) and {-y} to a custom Leaflet TileLayer
      if (tileServerURL.includes('{q}') || tileServerURL.includes('{-y}')) {
         const CustomTileLayer = L.TileLayer.extend({
            getTileUrl(coords) {
               let url = tileServerURL
                  .replace('{x}', coords.x)
                  .replace('{y}', coords.y)
                  .replace('{-y}', -coords.y)
                  .replace('{z}', coords.z)
                  .replace('{q}', toQuadKey(coords.x, coords.y, coords.z))
               return url
            },
         })
         return new CustomTileLayer(tileServerURL)
      }
      // Standard Leaflet placeholders {x}, {y}, {z} — use as-is
      return L.tileLayer(tileServerURL)
   }
   // Plain base URL — append {z}/{x}/{y}.png
   const base = tileServerURL.endsWith('/') ? tileServerURL : tileServerURL + '/'
   return L.tileLayer(base + '{z}/{x}/{y}.png')
}
