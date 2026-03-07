import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const netxms = {
  50: '#FFF3EE',
  100: '#FFE4D6',
  200: '#FFC9AD',
  300: '#FFAA00',
  400: '#FE9403',
  500: '#FD7D05',
  600: '#FC6608',
  700: '#F53A0A',
  800: '#E82400',
  900: '#C41F00',
  950: '#1A0A04',
}

export const themePreset = definePreset(Aura, {
  semantic: { primary: netxms },
})
