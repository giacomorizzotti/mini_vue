/**
 * Locale entry point, for projects that use vue-i18n and provide
 * @/config/locale (AVAILABLE_LOCALES, LOCALE_STORAGE_KEY):
 *
 *   import { useLocale, LanguageSwitcher } from '@/mini/locale'
 *
 * These are kept out of the components and composables barrels because
 * useLocale.js imports vue-i18n and @/config/locale, so a project without
 * them couldn't import either barrel at all.
 */
export { useLocale, detectInitialLocale, localeRoute } from './composables/useLocale'
export { default as LanguageSwitcher } from './components/LanguageSwitcher.vue'
