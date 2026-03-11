const brandModules = import.meta.glob('./*/index.js', { eager: true })

const brandName = import.meta.env.VITE_BRAND || 'netxms'
const brandModule = brandModules[`./${brandName}/index.js`]

if (!brandModule) {
   throw new Error(`Unknown brand "${brandName}". Available: ${Object.keys(brandModules).map((k) => k.split('/')[1]).join(', ')}`)
}

export const brand = brandModule.default
