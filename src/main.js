import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { themePreset } from '@/themes'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, GaugeChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  VisualMapComponent,
} from 'echarts/components'

import App from './App.vue'
import router from './router'
import { brand } from '@/brands'

import 'primeicons/primeicons.css'
import '@/assets/styles/main.css'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  VisualMapComponent,
])

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: themePreset,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
})
app.use(ToastService)

app.directive('tooltip', Tooltip)

// Apply brand colors as CSS custom properties
function applyBrandColors(theme, root) {
  root.style.setProperty('--bg', theme.bg)
  root.style.setProperty('--surface', theme.surface)
  root.style.setProperty('--surface-2', theme.surface2)
  root.style.setProperty('--border', theme.border)
  root.style.setProperty('--text-primary', theme.textPrimary)
  root.style.setProperty('--text-secondary', theme.textSecondary)
  root.style.setProperty('--text-muted', theme.textMuted)
  root.style.setProperty('--accent', theme.accent)
}

const root = document.documentElement
applyBrandColors(brand.light, root)

// Re-apply when dark mode toggles
const observer = new MutationObserver(() => {
  const isDark = root.classList.contains('app-dark')
  applyBrandColors(isDark ? brand.dark : brand.light, root)
})
observer.observe(root, { attributes: true, attributeFilter: ['class'] })

document.title = `${brand.name} ${brand.title}`

app.mount('#app')
