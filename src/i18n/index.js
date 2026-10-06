import { locales, FALLBACK_LOCALE } from './locales'
import { useLocaleStore } from '@/stores/localeStore'

const messages = Object.fromEntries(locales.map((l) => [l.code, l.messages]))
const pluralRules = Object.fromEntries(locales.map((l) => [l.code, new Intl.PluralRules(l.code)]))

function lookup(code, key) {
   return key.split('.').reduce((node, part) => node?.[part], messages[code])
}

/**
 * Translate a message key (dot-separated path into the locale file) into the current
 * UI language, falling back to English for missing keys.
 *
 * {name} placeholders are replaced from params. Messages with plural forms are
 * selected by params.count.
 *
 * Reads the locale store, so it is reactive when called from templates and computeds.
 */
export function t(key, params = {}) {
   const { locale } = useLocaleStore()
   for (const code of [locale, FALLBACK_LOCALE]) {
      let message = lookup(code, key)
      if (message == null) continue
      if (typeof message === 'object') {
         message = message[pluralRules[code].select(params.count)] ?? message.other
      }
      return message.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match)
   }
   return key
}

export function formatTime(timestamp) {
   return new Date(timestamp).toLocaleTimeString(useLocaleStore().intlLocale, { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(date) {
   return date.toLocaleString(useLocaleStore().intlLocale)
}
