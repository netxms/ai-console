import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { brand } from '@/brands'

export const themePreset = definePreset(Aura, {
  semantic: { primary: brand.palette },
})
