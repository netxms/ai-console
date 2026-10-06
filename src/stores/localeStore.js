import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { locales, FALLBACK_LOCALE } from '@/i18n/locales'

const STORAGE_KEY = 'netxms-locale'

const isSupported = (code) => locales.some((l) => l.code === code)
const languageOf = (tag) => tag.toLowerCase().split('-')[0]

// Explicit user choice first, then the first supported browser language
function detectLocale() {
   const saved = localStorage.getItem(STORAGE_KEY)
   if (isSupported(saved)) return saved
   const preferred = (navigator.languages || []).map(languageOf).find(isSupported)
   return preferred || FALLBACK_LOCALE
}

export const useLocaleStore = defineStore('locale', () => {
   const locale = ref(detectLocale())
   const current = computed(() => locales.find((l) => l.code === locale.value))

   // Locale tag for Intl date/time formatting (undefined = browser default)
   const intlLocale = computed(() => {
      let tag = locale.value
      if (languageOf(navigator.language || '') === locale.value) {
         // Keep the browser's regional variant of the UI language (en-GB, de-AT, ...)
         tag = navigator.language
      } else if (locale.value === FALLBACK_LOCALE) {
         // English is also what users of unsupported languages get, so leave
         // regional formats to the browser instead of forcing US conventions
         return undefined
      }
      const { numberingSystem } = current.value
      return numberingSystem ? `${tag}-u-nu-${numberingSystem}` : tag
   })

   function apply() {
      document.documentElement.lang = locale.value
      document.documentElement.dir = current.value.dir
   }

   function setLocale(code) {
      if (isSupported(code)) locale.value = code
   }

   watch(locale, (val) => {
      localStorage.setItem(STORAGE_KEY, val)
      apply()
   })

   apply()

   return { locale, current, intlLocale, locales, setLocale }
})
