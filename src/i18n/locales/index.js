import en from './en'
import de from './de'
import ar from './ar'

export const FALLBACK_LOCALE = 'en'

// "name" is shown in the language switch, always written in the language itself
export const locales = [
   { code: 'en', name: 'English', dir: 'ltr', messages: en },
   { code: 'de', name: 'Deutsch', dir: 'ltr', messages: de },
   // Latin digits keep formatted dates consistent with metric values, which are shown as received
   { code: 'ar', name: 'العربية', dir: 'rtl', numberingSystem: 'latn', messages: ar },
]
