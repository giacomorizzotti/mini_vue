import { useI18n } from 'vue-i18n'
import { AVAILABLE_LOCALES, LOCALE_STORAGE_KEY } from '@/config/locale'

/** Locale switching -- persisted to localStorage, keeps <html lang> in
 * sync (mini's GDPR component auto-detects its own language from that
 * attribute rather than plugging into vue-i18n directly, so this must
 * stay in lockstep with `locale` on every change). Expects the consuming
 * project to provide `@/config/locale`, exporting `AVAILABLE_LOCALES`
 * (array of locale codes) and `LOCALE_STORAGE_KEY` (localStorage key
 * string) -- same implicit-contract shape stores/auth.js already
 * establishes for `@/config/auth`.
 *
 * Label text for each code is the consumer's own job, not returned here
 * -- LanguageSwitcher.vue resolves it via `$t('lang.' + code)`, so a
 * project adopting this composable needs a `lang` key in its own locale
 * files (one entry per supported code, e.g. `{"lang": {"en": "English",
 * "it": "Italiano"}}`). Extracted from jpm's website/frontend, which used
 * to each hand-roll a near-identical copy of this (already drifted --
 * different locale lists, one used plain object labels instead of i18n
 * keys -- before being unified here 2026-09-18). */
export function useLocale() {
  const { locale } = useI18n()

  function setLocale(lang) {
    if (!AVAILABLE_LOCALES.includes(lang)) return
    locale.value = lang
    localStorage.setItem(LOCALE_STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }

  return { locale, setLocale, availableLocales: AVAILABLE_LOCALES }
}

/** Bootstrap-time locale detection -- for main.js, before createI18n (and
 * so useI18n()) exists yet: saved preference, else the browser's own
 * language if supported, else 'en'. Same @/config/locale contract as
 * useLocale above; kept as a separate plain function (not folded into
 * useLocale) since it must run outside any Vue app/component context. */
export function detectInitialLocale() {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (AVAILABLE_LOCALES.includes(saved)) return saved
  const browserLang = navigator.language?.split('-')[0]
  if (AVAILABLE_LOCALES.includes(browserLang)) return browserLang
  return 'en'
}
